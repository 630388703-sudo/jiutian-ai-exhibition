import math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 4000, 2000  # 2:1 equirectangular, spec-recommended size

# scene: (label_cn, label_en, base_top, base_bottom, accent)
scenes = {
    "hall-01":     ("未来AI大厅",     "FUTURE AI HALL",        (235,242,250), (198,214,232), (110,168,230)),
    "hall-02":     ("未来AI大厅 · 环廊", "AI HALL — ATRIUM",    (238,244,250), (202,217,234), (120,175,235)),
    "jiutian-01":  ("九天大模型中心",  "JIUTIAN CORE",          (230,238,248), (170,190,222), (90,140,225)),
    "jiutian-02":  ("九天大模型 · 数据环", "JIUTIAN DATA RING", (228,236,248), (165,186,222), (95,150,232)),
    "industry-01": ("智能制造车间",    "SMART FACTORY",         (236,242,248), (196,210,224), (120,165,210)),
    "industry-02": ("智能制造 · 产线",  "PRODUCTION LINE",      (238,243,248), (200,213,226), (125,168,212)),
    "people-01":   ("智慧健康空间",    "SMART HEALTH",          (238,246,248), (196,222,226), (100,190,205)),
    "people-02":   ("智慧教育空间",    "SMART EDUCATION",       (238,246,246), (198,224,220), (105,190,190)),
    "city-01":     ("智慧城市中枢",    "SMART CITY CORE",       (233,240,248), (180,198,226), (95,150,220)),
    "future-01":   ("青年与未来",      "CREATE THE FUTURE",     (245,240,248), (222,208,236), (170,140,225)),
}

def load_font(size, bold=False):
    idx = 1 if bold else 0
    paths = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size, index=0)
        except Exception:
            continue
    return ImageFont.load_default()

for key, (cn, en, top, bottom, accent) in scenes.items():
    img = Image.new("RGB", (W, H), top)
    draw = ImageDraw.Draw(img)

    # vertical gradient sky -> horizon
    for y in range(H):
        t = y / H
        r = int(top[0] + (bottom[0]-top[0])*t)
        g = int(top[1] + (bottom[1]-top[1])*t)
        b = int(top[2] + (bottom[2]-top[2])*t)
        draw.line([(0,y),(W,y)], fill=(r,g,b))

    # horizon band (floor) - lower third slightly darker / different for equirect floor
    horizon_y = int(H*0.62)
    for y in range(horizon_y, H):
        t = (y-horizon_y)/(H-horizon_y)
        r = int(bottom[0]*(1-t*0.35))
        g = int(bottom[1]*(1-t*0.30))
        b = int(bottom[2]*(1-t*0.20))
        draw.line([(0,y),(W,y)], fill=(r,g,b))

    # perspective floor grid converging toward center (simulate museum floor, wraps seamlessly-ish)
    cx = W/2
    vp_y = horizon_y
    n_radial = 48
    for i in range(n_radial):
        x0 = i * (W/n_radial)
        draw.line([(x0, H), (cx + (x0-cx)*0.06, vp_y)], fill=tuple(min(255,c+15) for c in bottom), width=2)
    n_rings = 10
    for i in range(1, n_rings+1):
        y = vp_y + (H-vp_y) * (i/n_rings)**1.6
        draw.line([(0,y),(W,y)], fill=tuple(min(255,c+10) for c in bottom), width=1)

    # ceiling ring lines (tech dome feel)
    n_dome = 26
    for i in range(n_dome):
        x0 = i * (W/n_dome)
        draw.line([(x0,0),(cx+(x0-cx)*0.08, vp_y)], fill=tuple(min(255,c+8) for c in top), width=1)

    # accent glow columns (structural elements, subtle)
    random.seed(hash(key) % 9999)
    for i in range(6):
        x = random.randint(0, W)
        w = random.randint(18, 46)
        col = tuple(int(a*0.55+b*0.45) for a,b in zip(accent, top))
        draw.rectangle([x, int(H*0.15), x+w, horizon_y], fill=None, outline=col, width=2)

    # soft blur for atmosphere
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    draw = ImageDraw.Draw(img)

    # center label block (appears "in front" of viewer at yaw=0)
    font_cn = load_font(120, bold=True)
    font_en = load_font(46)
    font_tag = load_font(34)

    label_cx = W//2
    label_cy = int(H*0.40)

    tb = draw.textbbox((0,0), cn, font=font_cn)
    tw = tb[2]-tb[0]
    draw.text((label_cx - tw/2, label_cy - 90), cn, font=font_cn, fill=(60,70,90))

    eb = draw.textbbox((0,0), en, font=font_en)
    ew = eb[2]-eb[0]
    draw.text((label_cx - ew/2, label_cy + 50), en, font=font_en, fill=tuple(int(c*0.7) for c in accent))

    tag = "PLACEHOLDER PANORAMA · 待替换为最终全景图"
    gb = draw.textbbox((0,0), tag, font=font_tag)
    gw = gb[2]-gb[0]
    draw.text((label_cx - gw/2, label_cy + 130), tag, font=font_tag, fill=(150,150,150))

    # repeat a faint watermark near the seams (left/right edges) so it tiles reasonably
    for x in (60, W-60-300):
        draw.text((x, 40), "JIUTIAN · 九天智境", font=font_tag, fill=(150,160,180))

    img.save(f"assets/panorama/{key}.jpg", quality=85, optimize=True)
    print("generated", key, img.size)
