import zlib
import struct
import math

def create_png(width, height, filename):
    # RGBA image buffer
    raw_data = bytearray()
    
    cx, cy = width / 2, height / 2
    r_corner = width * 0.22
    
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        for x in range(width):
            # Check rounded box
            dx = max(abs(x - cx) - (cx - r_corner), 0)
            dy = max(abs(y - cy) - (cy - r_corner), 0)
            dist_corner = math.sqrt(dx*dx + dy*dy)
            
            if dist_corner > r_corner:
                # Outside rounded box (transparent)
                raw_data.extend((0, 0, 0, 0))
                continue
                
            # Base dark financial terminal background gradient (#0b101d to #040711)
            t = (x + y) / (width + height)
            r = int(11 * (1 - t) + 4 * t)
            g = int(16 * (1 - t) + 7 * t)
            b = int(29 * (1 - t) + 17 * t)
            a = 255
            
            # Draw subtle cyan/emerald upward chart curve
            # Normalized coordinates (0 to 1)
            nx = x / width
            ny = 1.0 - (y / height)
            
            # Target curve: y = 0.2 + 0.6 * (nx ** 1.3)
            target_ny = 0.25 + 0.55 * (nx ** 1.4)
            dist_to_curve = abs(ny - target_ny)
            
            thickness = 0.035
            if dist_to_curve < thickness:
                intensity = 1.0 - (dist_to_curve / thickness)
                # Gradient from sky-blue (#0284c7) to emerald (#34d399)
                cr = int(2 + (52 - 2) * nx)
                cg = int(132 + (211 - 132) * nx)
                cb = int(199 + (153 - 199) * nx)
                
                r = int(r * (1 - intensity) + cr * intensity)
                g = int(g * (1 - intensity) + cg * intensity)
                b = int(b * (1 - intensity) + cb * intensity)
            
            # Draw subtle bar columns
            for bx in [0.25, 0.40, 0.55, 0.70]:
                bar_h = 0.2 + 0.6 * (bx ** 1.4)
                if abs(nx - bx) < 0.035 and 0.18 < ny < bar_h:
                    r = min(255, int(r * 0.4 + 20))
                    g = min(255, int(g * 0.4 + 100))
                    b = min(255, int(b * 0.4 + 180))

            raw_data.extend((r, g, b, a))

    # PNG File Structure
    png_bytes = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_bytes.extend(struct.pack('>I', len(ihdr_data)))
    png_bytes.extend(b'IHDR')
    png_bytes.extend(ihdr_data)
    png_bytes.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff))
    
    # IDAT
    compressed = zlib.compress(bytes(raw_data), level=9)
    png_bytes.extend(struct.pack('>I', len(compressed)))
    png_bytes.extend(b'IDAT')
    png_bytes.extend(compressed)
    png_bytes.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    # IEND
    png_bytes.extend(struct.pack('>I', 0))
    png_bytes.extend(b'IEND')
    png_bytes.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    
    with open(filename, 'wb') as f:
        f.write(png_bytes)
    print(f"Generated {filename} ({width}x{height})")

if __name__ == '__main__':
    create_png(192, 192, 'apps/web/public/icons/icon-192.png')
    create_png(512, 512, 'apps/web/public/icons/icon-512.png')
    create_png(180, 180, 'apps/web/public/icons/apple-touch-icon.png')
    create_png(32, 32, 'apps/web/public/favicon.ico')
