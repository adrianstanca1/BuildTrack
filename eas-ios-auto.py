#!/usr/bin/env python3
"""
EAS iOS Credentials Automation via PTY
Handles interactive prompts from EAS CLI including Apple ID + 2FA
"""
import pty, os, select, termios, struct, fcntl, sys, time

APPLE_ID = "adrian.stanca1@icloud.com"
APPLE_PASSWORD = os.environ.get("APPLE_PASSWORD", "")  # loaded from env; never hardcode
TEAM_ID = "4G3G5MX9BH"

def main():
    master, slave = pty.openpty()
    
    # Set raw mode
    old = termios.tcgetattr(master)
    new = termios.tcgetattr(master)
    new[3] = new[3] & ~termios.ECHO
    termios.tcsetattr(master, termios.TCSANOW, new)
    
    pid = os.fork()
    if pid == 0:
        os.close(master)
        os.setsid()
        os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)
        os.close(slave)
        os.chdir('/root/BuildTrack')
        os.execv('/usr/bin/eas', ['eas', 'credentials', '--platform', 'ios'])

    os.close(slave)
    
    buf = b''
    step = 0
    start_time = time.time()
    
    while time.time() - start_time < 300:  # 5 minute timeout
        r, w, e = select.select([master], [], [], 0.5)
        if master in r:
            try:
                data = os.read(master, 4096)
            except OSError:
                break
            if not data:
                break
            buf += data
            sys.stdout.buffer.write(data)
            sys.stdout.flush()
            
        text = buf.decode('utf-8', errors='ignore')
        
        # Step 0: Select production-ios (5th option = 4 downs)
        if step == 0 and 'Which build profile' in text and 'production-ios' in text:
            for _ in range(4):
                os.write(master, b'\x1b[B')
                time.sleep(0.1)
            os.write(master, b'\r')
            step = 1
            buf = b''
            print(f"\n[STEP {step}] Selected production-ios", file=sys.stderr)
            time.sleep(1)
            
        # Step 1: Team Type (Individual = 3rd = 2 downs)
        elif step == 1 and 'Select your Apple Team Type' in text:
            for _ in range(2):
                os.write(master, b'\x1b[B')
                time.sleep(0.1)
            os.write(master, b'\r')
            step = 2
            buf = b''
            print(f"\n[STEP {step}] Selected Individual", file=sys.stderr)
            time.sleep(1)
            
        # Step 2: Apple Team ID
        elif step == 2 and 'Apple Team ID:' in text:
            os.write(master, f'{TEAM_ID}\r'.encode())
            step = 3
            buf = b''
            print(f"\n[STEP {step}] Entered Team ID", file=sys.stderr)
            time.sleep(1)
            
        # Step 3: What to do (Build Credentials = 1st = Enter)
        elif step == 3 and 'What do you want to do?' in text and 'Build Credentials' in text:
            os.write(master, b'\r')
            step = 4
            buf = b''
            print(f"\n[STEP {step}] Selected Build Credentials", file=sys.stderr)
            time.sleep(1)
            
        # Step 4: All: Set up all (1st = Enter)
        elif step == 4 and 'What do you want to do?' in text and 'All:' in text:
            os.write(master, b'\r')
            step = 5
            buf = b''
            print(f"\n[STEP {step}] Selected All", file=sys.stderr)
            time.sleep(2)
            
        # Step 5: Apple ID prompt (new! appears after "Log in to your Apple Developer account")
        elif step == 5 and 'Apple ID:' in text and 'adrian' not in text.lower():
            os.write(master, f'{APPLE_ID}\r'.encode())
            step = 6
            buf = b''
            print(f"\n[STEP {step}] Entered Apple ID", file=sys.stderr)
            time.sleep(2)
            
        # Step 6: Apple ID password prompt
        elif step == 6 and ('Apple Developer password' in text or 'Password:' in text or 'password' in text.lower()):
            os.write(master, f'{APPLE_PASSWORD}\r'.encode())
            step = 7
            buf = b''
            print(f"\n[STEP {step}] Entered password", file=sys.stderr)
            time.sleep(3)
            
        # Step 7: 2FA code prompt
        elif step == 7 and ('two-factor' in text.lower() or '2fa' in text.lower() or 'verification code' in text.lower() or '6-digit' in text.lower()):
            print(f"\n[2FA REQUIRED] Waiting for 6-digit code...", file=sys.stderr)
            # Don't auto-respond - user needs to provide 2FA code
            # We'll wait here for manual input or timeout
            time.sleep(30)  # Wait for user to see prompt
            
        # Step 8: Generate cert (Yes = Enter)
        elif step == 8 and 'Generate a new Apple Developer Program membership certificate' in text:
            os.write(master, b'\r')
            step = 9
            buf = b''
            print(f"\n[STEP {step}] Confirmed cert generation", file=sys.stderr)
            time.sleep(2)
            
        # Step 9: Generate profile (Yes = Enter)  
        elif step == 9 and 'Generate a new Apple Developer Program provisioning profile' in text:
            os.write(master, b'\r')
            step = 10
            buf = b''
            print(f"\n[STEP {step}] Confirmed profile generation", file=sys.stderr)
            time.sleep(2)

    os.waitpid(pid, 0)
    print(f"\n[EXIT] Step reached: {step}", file=sys.stderr)

if __name__ == '__main__':
    main()
