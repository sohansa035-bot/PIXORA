import time
import os
from playwright.sync_api import sync_playwright

output_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\de3a0a9d-29f5-4903-8376-3d0e693a3c01"
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 950})
    
    # 1. Landing / Hero
    page.goto("http://localhost:3001", wait_until="networkidle")
    time.sleep(1)
    hero_path = os.path.join(output_dir, "localhost_hero.png")
    page.screenshot(path=hero_path)
    print("1. Saved hero screenshot:", hero_path)
    
    # 2. Image Workspace section
    page.locator("#image").scroll_into_view_if_needed()
    time.sleep(0.5)
    img_path = os.path.join(output_dir, "localhost_image_viewer.png")
    page.screenshot(path=img_path)
    print("2. Saved image viewer screenshot:", img_path)
    
    # 3. Evidence section
    page.locator("#evidence").scroll_into_view_if_needed()
    time.sleep(0.5)
    ev_path = os.path.join(output_dir, "localhost_evidence.png")
    page.screenshot(path=ev_path)
    print("3. Saved evidence screenshot:", ev_path)
    
    # 4. Assessment section
    page.locator("#assessment").scroll_into_view_if_needed()
    time.sleep(0.5)
    ass_path = os.path.join(output_dir, "localhost_assessment.png")
    page.screenshot(path=ass_path)
    print("4. Saved assessment screenshot:", ass_path)

    # 5. Ingestion Setup Modal
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.3)
    ingest_btn = page.locator("button:has-text('INGEST IMAGE')").first
    if ingest_btn.is_visible():
        ingest_btn.click()
        time.sleep(0.5)
        modal_path = os.path.join(output_dir, "localhost_ingest_modal.png")
        page.screenshot(path=modal_path)
        print("5. Saved ingest modal screenshot:", modal_path)
        
    browser.close()
