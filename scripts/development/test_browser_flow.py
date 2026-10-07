import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to http://localhost:3001...")
        page.goto("http://localhost:3001", wait_until="networkidle")
        time.sleep(1)

        tests = [
            ("TEST 1 (Camera Photo with EXIF)", "test_camera_photo.jpg"),
            ("TEST 2 (Tampered JPEG with Software Tag)", "test_tampered_software.jpg"),
            ("TEST 3 (Lossless Valid PNG)", "test_valid.png"),
            ("TEST 4 (Noisy JPEG without EXIF)", "test_noise_noexif.jpg"),
            ("TEST 5 (Re-upload Camera Photo - Stale Check)", "test_camera_photo.jpg"),
        ]

        results = []

        for test_name, asset_name in tests:
            print(f"\n========================================================")
            print(f"RUNNING {test_name}: {asset_name}")
            print(f"========================================================")

            # 1. Click NEW INVESTIGATION button (in sticky navbar or hero)
            page.locator("button:has-text('NEW INVESTIGATION'), button:has-text('INGEST IMAGE')").first.click()
            modal = page.locator(".fixed.inset-0:has-text('INGEST IMAGE')")
            modal.wait_for(state="visible", timeout=5000)
            time.sleep(0.5)

            # 2. Inside modal, click the test asset button
            test_asset_btn = modal.locator(f"button:has-text('{asset_name}')").first
            test_asset_btn.click()
            time.sleep(1.0)

            # 3. Click START INVESTIGATION inside the modal
            start_btn = modal.locator("button:has-text('START INVESTIGATION')")
            start_btn.click()

            # 4. Wait for scanning modal to appear and complete
            print("Waiting for scanning modal...")
            page.wait_for_selector("text=Analyzing image…", state="visible", timeout=10000)
            time.sleep(0.5)
            skip_btn = page.locator("button:has-text('Skip')")
            if skip_btn.count() > 0:
                skip_btn.click()
            page.wait_for_selector("text=Analyzing image…", state="detached", timeout=10000)
            time.sleep(1.2)

            # 5. Extract UI values from Assessment section
            assessment_el = page.locator("section#assessment")
            assessment_text = assessment_el.inner_text()

            # Extract key fields
            outcome = page.locator("section#assessment .font-editorial.text-4xl, section#assessment .font-editorial.text-6xl, section#assessment .font-editorial.text-7xl").first.inner_text().strip()
            
            # Extract Case Bar info
            case_bar = page.locator("#image").first.inner_text()
            
            # Extract the 4 sections
            cards = page.locator("section#assessment .grid.grid-cols-1 > div").all()
            sections_data = {}
            for card in cards:
                lines = [l.strip() for l in card.inner_text().split("\n") if l.strip()]
                if lines:
                    title = lines[0]
                    items = [l.replace("•", "").strip() for l in lines[1:] if l != "•"]
                    sections_data[title] = items

            # Extract recommended next step
            rec_step = "N/A"
            if page.locator("text=RECOMMENDED NEXT STEP").count() > 0:
                rec_step = page.locator("text=RECOMMENDED NEXT STEP").locator("..").inner_text().strip()
            
            screenshot_path = f"s:/projects/Pixora/docs/screenshots/test_{asset_name.replace('.', '_')}.png"
            page.screenshot(path=screenshot_path)

            print(f"Outcome: {outcome}")
            print(f"Established items: {sections_data.get('WHAT CAN BE ESTABLISHED', [])}")
            print(f"Supporting items: {sections_data.get('WHAT SUPPORTS IT', [])}")
            print(f"Conflicts items: {sections_data.get('WHAT CONFLICTS', [])}")
            print(f"Missing items: {sections_data.get('WHAT CANNOT BE ESTABLISHED', [])}")
            print(f"Screenshot saved: {screenshot_path}")

            results.append({
                "test": test_name,
                "asset": asset_name,
                "outcome": outcome,
                "established": sections_data.get('WHAT CAN BE ESTABLISHED', []),
                "supporting": sections_data.get('WHAT SUPPORTS IT', []),
                "conflicts": sections_data.get('WHAT CONFLICTS', []),
                "cannot": sections_data.get('WHAT CANNOT BE ESTABLISHED', []),
            })

        browser.close()

        print("\n\n========================================================")
        print("FINAL VERIFICATION SUMMARY")
        print("========================================================")
        for r in results:
            print(f"\n{r['test']}:")
            print(f"  Asset: {r['asset']}")
            print(f"  Assessment: {r['outcome']}")
            print(f"  Established: {r['established']}")
            print(f"  Supporting: {r['supporting']}")
            print(f"  Conflicts: {r['conflicts']}")
            print(f"  Cannot: {r['cannot']}")

        # Validate that Test 1 and Test 2 have different outcomes
        assert results[0]['outcome'] != results[1]['outcome'], "Test 1 and Test 2 must have different outcomes!"
        # Validate that Test 1 and Test 5 have matching outcomes (no stale state)
        assert results[0]['outcome'] == results[4]['outcome'], "Test 1 and Test 5 must match!"
        print("\nALL AUTOMATED VERIFICATION ASSERTIONS PASSED!")

if __name__ == "__main__":
    run_tests()
