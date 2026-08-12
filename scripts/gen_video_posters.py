from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

W, H = 1280, 720

videos = {
    "opening":  ("智能时代 · 未来中国", "OPENING", (232,240,250),(150,178,224),(90,140,225)),
    "jiutian":  ("九天大模型 · 智能赋能", "JIUTIAN AI", (228,236,248),(140,168,222),(80,130,220)),
    "industry": ("AI赋能产业现代化", "SMART INDUSTRY", (236,242,246),(160,188,206),(110,160,190)),
    "people":   ("AI服务人民生活", "AI FOR PEOPLE", (236,246,246),(150,208,206),(90,180,180)),
    "city":     ("智慧城市治理", "SMART CITY", (232,240,250),(140,172,222),(90,140,220)),
    "future":   ("青年与AI未来", "CREATE THE FUTURE", (244,238,250),(196,178,228),(150,120,215)),
}

def load_font(size, bold=False):
    p = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
    return ImageFont.truetype(p, size, index=0)

for key, (cn, en, top, bottom, accent) in videos.items():
    img = Image.new("RGB", (W, H), top)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(top[0] + (bottom[0]-top[0])*t)
        g = int(top[1] + (bottom[1]-top[1])*t)
        b = int(top[2] + (bottom[2]-top[2])*t)
        draw.line([(0,y),(W,y)], fill=(r,g,b))

    random.seed(hash(key) % 999)
    for i in range(40):
        x = random.randint(0, W)
        y = random.randint(0, H)
        r = random.randint(1,2)
        draw.ellipse([x-r,y-r,x+r,y+r], fill=tuple(min(255,c+30) for c in accent))

    img = img.filter(ImageFilter.GaussianBlur(0.6))
    draw = ImageDraw.Draw(img)

    f_cn = load_font(64, bold=True)
    f_en = load_font(26)
    f_tag = load_font(20)

    tb = draw.textbbox((0,0), cn, font=f_cn)
    tw = tb[2]-tb[0]
    draw.text((W/2-tw/2, H/2-70), cn, font=f_cn, fill=(55,65,85))

    eb = draw.textbbox((0,0), en, font=f_en)
    ew = eb[2]-eb[0]
    draw.text((W/2-ew/2, H/2+20), en, font=f_en, fill=tuple(int(c*0.65) for c in accent))

    # play-button ring hint
    cx, cy, rr = W/2, H/2+110, 34
    draw.ellipse([cx-rr,cy-rr,cx+rr,cy+rr], outline=(255,255,255), width=3)
    draw.polygon([(cx-10,cy-16),(cx-10,cy+16),(cx+16,cy)], fill=(255,255,255))

    tag = "AIGC VIDEO PLACEHOLDER · 待替换为最终AI生成视频"
    gb = draw.textbbox((0,0), tag, font=f_tag)
    gw = gb[2]-gb[0]
    draw.text((W/2-gw/2, H-56), tag, font=f_tag, fill=(120,120,130))

    img.save(f"assets/video/{key}-poster.jpg", quality=87)
    print("poster", key)
