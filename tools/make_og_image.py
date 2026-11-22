#!/usr/bin/env python3
"""og-image v2 for 塔罗秘境 · Mystic Tarot — 1200x630, rendered at 2x.

Design: deep-indigo starfield (brand), left text block (gold MYSTIC TAROT,
big warm-white 塔罗秘境, lavender tagline, domain), right a fan of three
real 1909 Rider-Waite cards (Fool / Star / Moon) with gold frames.
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CARDS = os.path.join(ROOT, 'public', 'cards')
OUT = os.path.join(ROOT, 'public', 'og-image.jpg')

S = 2  # supersample
W, H = 1200 * S, 630 * S

SERIF_CJK = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'
SERIF_LATIN = '/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf'

GOLD = (217, 180, 91)
GOLD_DEEP = (178, 141, 58)
CREAM = (246, 240, 224)
LAV = (203, 192, 238)
MUTED = (157, 146, 196)


def vgrad(w, h, top, bottom):
    base = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / (h - 1)
        base.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return base.resize((w, h))


def glow(img, cx, cy, r, color, peak):
    g = Image.new('L', img.size, 0)
    gd = ImageDraw.Draw(g)
    steps = 24
    for i in range(steps, 0, -1):
        rr = r * i / steps
        gd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=int(peak * (1 - i / steps) ** 2))
    g = g.filter(ImageFilter.GaussianBlur(r * 0.25))
    tint = Image.new('RGB', img.size, color)
    img.paste(Image.composite(tint, img, g.point(lambda v: v // 3)), (0, 0))


def starfield(img, seed=7):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(img, 'RGBA')
    for _ in range(240):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        r = rnd.uniform(0.8, 2.6) * S / 2
        a = rnd.randint(50, 200)
        c = (255, 244, 214, a) if rnd.random() < 0.3 else (235, 232, 255, a)
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    for _ in range(7):  # a few 4-point sparkles
        x, y = rnd.uniform(60, W - 60), rnd.uniform(50, H - 200)
        L = rnd.uniform(9, 15) * S / 2
        a = rnd.randint(120, 190)
        d.polygon([(x, y - L), (x + L * 0.18, y - L * 0.18), (x + L, y),
                   (x + L * 0.18, y + L * 0.18), (x, y + L),
                   (x - L * 0.18, y + L * 0.18), (x - L, y),
                   (x - L * 0.18, y - L * 0.18)], fill=(255, 240, 200, a))


def framed_card(path, card_h):
    im = Image.open(path).convert('RGB')
    w = int(card_h * im.width / im.height)
    im = im.resize((w, card_h), Image.LANCZOS)
    border = 7 * S // 2
    card = Image.new('RGBA', (w + border * 2, card_h + border * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle([0, 0, card.width - 1, card.height - 1], radius=18 * S // 2,
                        fill=GOLD_DEEP + (255,))
    d.rounded_rectangle([3, 3, card.width - 4, card.height - 4], radius=15 * S // 2,
                        fill=GOLD + (255,))
    card.paste(im, (border, border))
    return card


def paste_rot(base, card, center, angle):
    rot = card.rotate(angle, expand=True, resample=Image.BICUBIC)
    sh = Image.new('RGBA', rot.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle([10 * S, 14 * S, rot.width - 10 * S, rot.height - 2 * S],
                         radius=16 * S // 2, fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(10 * S // 2))
    base.alpha_composite(sh, (int(center[0] - rot.width / 2 + 8 * S),
                               int(center[1] - rot.height / 2 + 12 * S)))
    base.alpha_composite(rot, (int(center[0] - rot.width / 2),
                               int(center[1] - rot.height / 2)))


def spaced(draw, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x - tracking


def main():
    img = vgrad(W, H, (27, 20, 64), (13, 10, 34)).convert('RGBA')
    glow(img, int(W * 0.78), int(H * 0.52), int(H * 0.62), (88, 64, 160), 120)
    glow(img, int(W * 0.80), int(H * 0.45), int(H * 0.34), (212, 175, 55), 46)
    starfield(img)

    # --- card fan (right) ---
    card_h = 428 * S
    cy = H * 0.56
    paste_rot(img, framed_card(os.path.join(CARDS, 'rws-0.webp'), card_h),
              (W * 0.700, cy + 30 * S), 14)
    paste_rot(img, framed_card(os.path.join(CARDS, 'rws-18.webp'), card_h),
              (W * 0.935, cy + 30 * S), -14)
    paste_rot(img, framed_card(os.path.join(CARDS, 'rws-17.webp'), int(card_h * 1.06)),
              (W * 0.818, cy), 0)

    # --- text block (left) ---
    d = ImageDraw.Draw(img)
    x = 84 * S
    f_brand = ImageFont.truetype(SERIF_LATIN, 30 * S)
    end = spaced(d, (x + 2 * S, 96 * S), 'MYSTIC TAROT', f_brand, GOLD, 13 * S)
    # ornament: line — diamond — line
    oy = 152 * S
    d.line([x + 2 * S, oy, x + 52 * S, oy], fill=GOLD + (255,), width=2 * S)
    cx, cy2 = x + 66 * S, oy
    r = 6 * S
    d.polygon([(cx, cy2 - r), (cx + r, cy2), (cx, cy2 + r), (cx - r, cy2)], fill=GOLD + (255,))
    d.line([x + 80 * S, oy, x + 130 * S, oy], fill=GOLD + (255,), width=2 * S)

    f_title = ImageFont.truetype(SERIF_CJK, 148 * S)
    d.text((x, 178 * S), '塔罗秘境', font=f_title, fill=CREAM + (255,))

    f_tag = ImageFont.truetype(SERIF_CJK, 33 * S)
    d.text((x + 2 * S, 372 * S), '沉浸式在线塔罗占卜 · 78 张塔罗牌图鉴',
           font=f_tag, fill=LAV + (255,))

    f_sub = ImageFont.truetype(SERIF_CJK, 26 * S)
    d.text((x + 2 * S, 428 * S), '每日一牌 · 三种牌阵 · 韦特原画',
           font=f_sub, fill=MUTED + (255,))

    f_dom = ImageFont.truetype(SERIF_LATIN, 24 * S)
    spaced(d, (x + 2 * S, 548 * S), 'taluopai.tbit.xin', f_dom, MUTED, 3 * S)

    # vignette
    v = Image.new('L', (W, H), 0)
    vd = ImageDraw.Draw(v)
    vd.ellipse([-W * 0.25, -H * 0.35, W * 1.25, H * 1.35], fill=255)
    v = v.filter(ImageFilter.GaussianBlur(120 * S // 2))
    black = Image.new('RGBA', (W, H), (5, 4, 16, 255))
    img = Image.composite(img, black, v)

    img.convert('RGB').resize((1200, 630), Image.LANCZOS).save(OUT, quality=90, optimize=True)
    print('wrote', OUT, os.path.getsize(OUT), 'bytes')


if __name__ == '__main__':
    main()
