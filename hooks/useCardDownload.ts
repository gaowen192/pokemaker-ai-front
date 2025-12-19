import { useState } from 'react';

/**
 * [Backend API Specification for Server-Side Image Generation]
 * 
 * Due to client-side rendering limitations (html2canvas) causing font misalignment and layout shifts,
 * we plan to move the card image generation to a backend service (e.g., Node.js + Puppeteer/Playwright or Canvas).
 *
 * 1. Endpoint
 *    POST /api/card/render
 *
 * 2. Request Parameters (Payload)
 *    The backend needs the full card state to reconstruct the UI.
 *    {
 *      "data": {
 *        "name": "Charizard",
 *        "hp": "330",
 *        "supertype": "Pokémon",
 *        "subtype": "Stage 2",
 *        "type": "Fire",
 *        "evolvesFrom": "Charmeleon",
 *        "image": "https://...", // Original user image URL
 *        "attacks": [
 *          {
 *            "name": "Flamethrower",
 *            "cost": ["Fire", "Colorless"],
 *            "damage": "100",
 *            "description": "..."
 *          }
 *        ],
 *        "weakness": "Water",
 *        "resistance": "None",
 *        "retreatCost": 2,
 *        "illustrator": "5ban Graphics",
 *        "setNumber": "006/165",
 *        "rarity": "Double Rare",
 *        "pokedexEntry": "...",
 *        "holoPattern": "Sheen",
 *        // ... include all other properties from CardData
 *        "styles": {
 *           "zoom": 1.2,
 *           "xOffset": 0,
 *           "yOffset": 0
 *        }
 *      },
 *      "config": {
 *        "scale": 4,          // High resolution factor
 *        "format": "png",     // Output format
 *        "quality": 1.0       // Image quality
 *      }
 *    }
 *
 * 3. Response Structure
 *    {
 *      "success": true,
 *      "data": {
 *        "downloadUrl": "https://api.example.com/generated/card_uuid.png",
 *        "contentType": "image/png",
 *        "expiresAt": "2024-12-31T23:59:59Z"
 *      }
 *    }
 * 
 * 4. Implementation Strategy
 *    - Frontend: Serialize `cardData` -> POST to API -> Wait -> Trigger download from returned `downloadUrl`.
 *    - Backend: Receive JSON -> Render HTML template -> Screenshot (Puppeteer) -> Upload to S3 -> Return URL.
 */

// A helper to inline images to Base64 to bypass CORS issues during capture
const toBase64 = async (url: string): Promise<string> => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    
    // Attempt direct fetch first (for CORS-enabled sources like Unsplash)
    // This avoids using public proxies which can be flaky
    try {
        const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (response.ok) {
            const blob = await response.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(url);
                reader.readAsDataURL(blob);
            });
        }
    } catch (e) {
        // Direct fetch failed (likely CORS), fall back to returning URL 
        // and letting html2canvas handle it with useCORS: true
    }

    return url; 
};

export const useCardDownload = (
    addNotification: (type: 'success' | 'error' | 'info', message: string) => void,
    t: (key: string) => string,
    cardName: string
) => {
    const [isDownloading, setIsDownloading] = useState(false);

    // TODO: Replace this client-side logic with backend API call once implemented.
    // See API specification above.
    const handleDownload = async () => {
        if (isDownloading) return;
        
        const element = document.getElementById('capture-card-node');
        if (!element) {
            addNotification('error', 'Card element not found.');
            return;
        }
    
        setIsDownloading(true);
        addNotification('info', t('msg.download_start'));
        
        // Safety timeout to prevent infinite spinning
        const safetyTimeout = setTimeout(() => {
            if (isDownloading) {
                setIsDownloading(false);
                addNotification('error', 'Download timed out. Please try again.');
            }
        }, 20000); // 20 seconds max

        try {
        // Add downloading attribute to document to trigger download mode styling
        document.documentElement.setAttribute('data-downloading', 'true');
        
        const clone = element.cloneNode(true) as HTMLElement;
        // On mobile, elements far off-screen (top: -9999px) might not get rendered by the browser engine.
        // Instead, we place it fixed at 0,0 but behind everything.
        clone.style.position = 'fixed';
        clone.style.left = '0';
        clone.style.top = '0';
        clone.style.zIndex = '-9999'; 
        clone.style.transform = 'none';
        clone.style.perspective = 'none';
        clone.style.backgroundColor = 'transparent';
            
            // Fix text rendering consistency
            clone.style.fontVariant = 'normal';
            clone.style.fontFeatureSettings = '"liga" 0';
            
            // Enforce explicit dimensions
            clone.style.width = '420px';
            clone.style.height = '588px';
            clone.style.imageRendering = 'auto';
            
            // Flatten 3D transforms for capture
            const preserve3d = clone.querySelector('div[style*="preserve-3d"]') as HTMLElement;
            if (preserve3d) {
                preserve3d.style.transformStyle = 'flat';
                preserve3d.style.transform = 'none';
            }
    
            // Hide Holo Overlay on download to prevent artifacts
            const holoOverlays = clone.querySelectorAll('.card-holo-overlay');
            holoOverlays.forEach((el: any) => el.style.display = 'none');
    
            document.body.appendChild(clone);
    
            const images = Array.from(clone.querySelectorAll('img'));
            
            // Process images with a race condition to avoid hanging indefinitely
            await Promise.race([
                Promise.all(images.map(async (img) => {
                    const originalSrc = img.src;
                    
                    // Try to inline if not data URI
                    if (!originalSrc.startsWith('data:')) {
                        try {
                            const base64 = await toBase64(originalSrc);
                            if (base64 !== originalSrc) {
                                img.src = base64;
                                img.srcset = '';
                                img.crossOrigin = 'anonymous';
                            }
                        } catch (e) {
                            console.warn("Failed to inline image, using original", e);
                        }
                    }
                    
                    // Wait for load event
                    await new Promise((resolve) => {
                        if (img.complete) resolve(true);
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(true);
                        // Per-image timeout
                        setTimeout(() => resolve(true), 3000); 
                    });
                })),
                // Max wait time for all image processing
                new Promise(resolve => setTimeout(resolve, 8000))
            ]);
    
            // Detect mobile to adjust scale
            // High scale (4) can crash mobile browsers due to canvas memory limits
            const isMobile = window.innerWidth < 768;
            const scale = isMobile ? 2 : 4;

            // @ts-ignore
            const canvas = await window.html2canvas(clone, {
                useCORS: true, // Crucial for external images
                allowTaint: true,
                backgroundColor: null,
                scale: scale, 
                logging: false,
                width: 420,
                height: 588,
                imageRendering: 'quality',
                removeContainer: true,
                // Critical fixes for text displacement/offset:
                scrollX: 0, 
                scrollY: 0,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            });
    
            document.body.removeChild(clone);
    
            const link = document.createElement('a');
            link.download = `${cardName.replace(/\s+/g, '_')}_Card.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            
            clearTimeout(safetyTimeout);
            addNotification('success', t('msg.download_complete'));
        } catch (e) {
            console.error(e);
            clearTimeout(safetyTimeout);
            addNotification('error', 'Download failed. Please try again.');
        } finally {
            // Remove downloading attribute after download completes
            document.documentElement.removeAttribute('data-downloading');
            setIsDownloading(false);
        }
    };

    return { isDownloading, handleDownload };
};
