# Planet Texture Download Guide

**Purpose:** Instructions for downloading and organizing planet textures for the visualization project.

**Primary Source:** Solar System Scope (https://www.solarsystemscope.com/textures/)
**License:** Attribution 4.0 International (CC BY 4.0) - Free for any use including commercial
**Resolution:** 2K (2048×1024 pixels) - Optimal balance of quality and performance

---

## 1. TEXTURE DOWNLOAD LIST

### Base URL
All textures are available at: `https://www.solarsystemscope.com/textures/`

### Required Downloads (2K Resolution):

#### Planets Directory (`/assets/textures/planets/`):

1. **Mercury**
   - File: `2k_mercury.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_mercury.jpg
   - Expected Size: ~500 KB
   - Target Filename: `mercury_color.jpg`

2. **Venus (Atmosphere)**
   - File: `2k_venus_atmosphere.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg
   - Expected Size: ~500 KB
   - Target Filename: `venus_color.jpg`
   - Note: Using atmosphere texture (what we see from space) rather than surface

3. **Earth (Day Map)**
   - File: `2k_earth_daymap.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg
   - Expected Size: ~1 MB
   - Target Filename: `earth_color.jpg`

4. **Mars**
   - File: `2k_mars.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_mars.jpg
   - Expected Size: ~600 KB
   - Target Filename: `mars_color.jpg`

5. **Jupiter**
   - File: `2k_jupiter.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg
   - Expected Size: ~800 KB
   - Target Filename: `jupiter_color.jpg`

6. **Saturn**
   - File: `2k_saturn.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_saturn.jpg
   - Expected Size: ~700 KB
   - Target Filename: `saturn_color.jpg`

7. **Uranus**
   - File: `2k_uranus.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_uranus.jpg
   - Expected Size: ~400 KB
   - Target Filename: `uranus_color.jpg`

8. **Neptune**
   - File: `2k_neptune.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_neptune.jpg
   - Expected Size: ~500 KB
   - Target Filename: `neptune_color.jpg`

#### Moons Directory (`/assets/textures/moons/`):

9. **Moon**
   - File: `2k_moon.jpg`
   - Download URL: https://www.solarsystemscope.com/textures/download/2k_moon.jpg
   - Expected Size: ~600 KB
   - Target Filename: `moon_color.jpg`

### Optional Downloads (For Future Enhancement):

10. **Earth Night Map** (City Lights - Emissive)
    - File: `2k_earth_nightmap.jpg`
    - Download URL: https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg
    - Target Filename: `earth_emissive.jpg`
    - Use: Glow effect for night side of Earth

11. **Earth Clouds**
    - File: `2k_earth_clouds.jpg`
    - Download URL: https://www.solarsystemscope.com/textures/download/2k_earth_clouds.jpg
    - Target Filename: `earth_clouds.jpg`
    - Use: Separate cloud layer (transparency layer)

12. **Saturn Ring Alpha**
    - File: `2k_saturn_ring_alpha.png`
    - Download URL: https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png
    - Target Filename: `saturn_ring_alpha.png`
    - Use: Ring transparency map (already have basic ring)

---

## 2. DOWNLOAD METHODS

### Method 1: Manual Download (Recommended)
1. Open each download URL in your browser
2. Right-click the image and select "Save image as..."
3. Save to the appropriate directory with the target filename
4. Verify file size matches expected size (±20%)

### Method 2: PowerShell Script (Automated)
Run this PowerShell script to download all textures:

```powershell
# Navigate to project directory
cd "C:\Users\winnl\Documents\ClaudeCodePlayground\real-time-geometric-visualization"

# Create directories
New-Item -ItemType Directory -Force -Path "assets\textures\planets"
New-Item -ItemType Directory -Force -Path "assets\textures\moons"

# Download planets
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_mercury.jpg" -OutFile "assets\textures\planets\mercury_color.jpg"
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg" -OutFile "assets\textures\planets\venus_color.jpg"
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg" -OutFile "assets\textures\planets\earth_color.jpg"
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_mars.jpg" -OutFile "assets\textures\planets\mars_color.jpg"
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg" -OutFile "assets\textures\planets\jupiter_color.jpg"
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_saturn.jpg" -OutFile "assets\textures\planets\saturn_color.jpg"
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_uranus.jpg" -OutFile "assets\textures\planets\uranus_color.jpg"
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_neptune.jpg" -OutFile "assets\textures\planets\neptune_color.jpg"

# Download moon
Invoke-WebRequest -Uri "https://www.solarsystemscope.com/textures/download/2k_moon.jpg" -OutFile "assets\textures\moons\moon_color.jpg"

Write-Host "Download complete! Textures saved to assets/textures/"
```

### Method 3: cURL Commands
```bash
cd real-time-geometric-visualization

# Download planets
curl -o "assets/textures/planets/mercury_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_mercury.jpg"
curl -o "assets/textures/planets/venus_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg"
curl -o "assets/textures/planets/earth_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg"
curl -o "assets/textures/planets/mars_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_mars.jpg"
curl -o "assets/textures/planets/jupiter_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg"
curl -o "assets/textures/planets/saturn_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_saturn.jpg"
curl -o "assets/textures/planets/uranus_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_uranus.jpg"
curl -o "assets/textures/planets/neptune_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_neptune.jpg"

# Download moon
curl -o "assets/textures/moons/moon_color.jpg" "https://www.solarsystemscope.com/textures/download/2k_moon.jpg"
```

---

## 3. FILE ORGANIZATION

### Expected Directory Structure:
```
real-time-geometric-visualization/
└── assets/
    └── textures/
        ├── planets/
        │   ├── mercury_color.jpg   (~500 KB)
        │   ├── venus_color.jpg     (~500 KB)
        │   ├── earth_color.jpg     (~1 MB)
        │   ├── mars_color.jpg      (~600 KB)
        │   ├── jupiter_color.jpg   (~800 KB)
        │   ├── saturn_color.jpg    (~700 KB)
        │   ├── uranus_color.jpg    (~400 KB)
        │   └── neptune_color.jpg   (~500 KB)
        └── moons/
            └── moon_color.jpg      (~600 KB)
```

### Total Expected Size: ~5.6 MB (all 9 textures)

---

## 4. FILE VERIFICATION

After downloading, verify files exist:

### PowerShell Verification:
```powershell
cd "C:\Users\winnl\Documents\ClaudeCodePlayground\real-time-geometric-visualization\assets\textures"

# Check planets
Get-ChildItem -Path "planets\*.jpg" | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}

# Check moons
Get-ChildItem -Path "moons\*.jpg" | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}
```

Expected output:
```
Name                Size(KB)
----                --------
mercury_color.jpg   ~500
venus_color.jpg     ~500
earth_color.jpg     ~1000
mars_color.jpg      ~600
jupiter_color.jpg   ~800
saturn_color.jpg    ~700
uranus_color.jpg    ~400
neptune_color.jpg   ~500

moon_color.jpg      ~600
```

---

## 5. TEXTURE OPTIMIZATION (If Needed)

If any texture exceeds 1.5 MB, compress it:

### Online Tools (Recommended):
- **TinyJPG/TinyPNG:** https://tinyjpg.com/ (Excellent compression, minimal quality loss)
- **Squoosh:** https://squoosh.app/ (Google's image optimizer)
- **ImageOptim:** https://imageoptim.com/ (Desktop app, Mac/Win)

### Compression Settings:
- **Format:** JPG (best compression for photos)
- **Quality:** 85-90% (sweet spot for quality vs size)
- **Target Size:** < 1 MB per texture
- **Resolution:** Keep at 2048×1024 (2K)

### GIMP Compression (Advanced):
```bash
# Install GIMP, then use command-line:
gimp -i -b '(let* ((image (car (gimp-file-load RUN-NONINTERACTIVE "input.jpg" "input.jpg")))
                   (drawable (car (gimp-image-get-active-layer image))))
              (file-jpeg-save RUN-NONINTERACTIVE image drawable "output.jpg" "output.jpg" 0.85 0 1 1 "" 0 1 0 0))
            (gimp-quit 0)'
```

---

## 6. ATTRIBUTION

### Required Attribution (CC BY 4.0):
These textures are from **Solar System Scope** under Creative Commons Attribution 4.0 International License.

**Attribution Text (to add to README.md):**
```
Planet textures by Solar System Scope (https://www.solarsystemscope.com/textures/)
Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
```

**License Requirements:**
- ✅ Attribution required (credit Solar System Scope)
- ✅ Free for commercial use
- ✅ Can be modified/adapted
- ✅ Can be redistributed

---

## 7. ALTERNATIVE SOURCES (If Solar System Scope Unavailable)

### Backup Option 1: Planet Pixel Emporium
- URL: http://planetpixelemporium.com/planets.html
- Resolution: Up to 2K available
- License: Free for personal/educational use
- Quality: Very high (based on real spacecraft data)

### Backup Option 2: Steve Albers' Planetary Maps
- URL: https://stevealbers.net/albers/sos/sos.html
- Resolution: 2K (2048×1024)
- License: Free for educational/personal use
- Note: Generally centered on ±180° longitude

### Backup Option 3: NASA 3D Resources
- URL: https://science.nasa.gov/3d-resources/
- Resolution: Varies (some very high-res)
- License: Public Domain (NASA content)
- Note: May require more processing/conversion

---

## 8. TROUBLESHOOTING

### Issue: Download fails with 403/404 error
**Solution:** Try manual download in browser, or check URL is still valid

### Issue: File size much larger than expected
**Solution:** Compress using TinyJPG before adding to project

### Issue: Texture appears upside down or rotated
**Solution:** This is normal - will be fixed in texture loading code with proper UV mapping

### Issue: Colors look wrong
**Solution:** Verify you downloaded correct texture variant (e.g., Venus atmosphere not surface)

---

## 9. CHECKLIST

Download completion checklist:

- [ ] Created `/assets/textures/planets/` directory
- [ ] Created `/assets/textures/moons/` directory
- [ ] Downloaded Mercury texture (mercury_color.jpg)
- [ ] Downloaded Venus texture (venus_color.jpg - atmosphere)
- [ ] Downloaded Earth texture (earth_color.jpg - daymap)
- [ ] Downloaded Mars texture (mars_color.jpg)
- [ ] Downloaded Jupiter texture (jupiter_color.jpg)
- [ ] Downloaded Saturn texture (saturn_color.jpg)
- [ ] Downloaded Uranus texture (uranus_color.jpg)
- [ ] Downloaded Neptune texture (neptune_color.jpg)
- [ ] Downloaded Moon texture (moon_color.jpg)
- [ ] Verified all file sizes (should be ~5.6 MB total)
- [ ] Compressed any files > 1.5 MB (if needed)
- [ ] Added attribution to README.md

---

**Document Version:** 1.0
**Last Updated:** 2025-01-15
**Next Action:** Run PowerShell download script or manually download all textures
