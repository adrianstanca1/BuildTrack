#!/usr/bin/env python3
"""
EAS iOS Credentials Automation v2
Handles pre-filled Apple ID state from saved keychain
"""
import pty, os, select, termios, sys, time

APPLE_PASSWORD = os.environ.get("APPLE_PASSWORD", "")  # loaded from env; never hardcode

def main():
    master, slave = pty.openpty()
    pid = os.fork()
    if pid == 0:
        os.close(master)
        os.setsid()
        for fd in (0, 1, 2):
            os.dup2(slave, fd)
        os.close(slave)
        os.chdir('/root/BuildTrack')
        os.execv('/usr/bin/eas', ['eas', 'credentials', '--platform', 'ios'])
    os.close(slave)

    buf = b''
    state = 'start'
    start = time.time()
    # Make master non-blocking
    import fcntl
    fl = fcntl.fcntl(master, fcntl.F_GETFL)
    fcntl.fcntl(master, fcntl.F_SETFL, fl | os.O_NONBLOCK)

    while time.time() - start < 300:
        try:
            data = os.read(master, 4096)
            if data:
                buf += data
                sys.stdout.buffer.write(data)
                sys.stdout.flush()
        except BlockingIOError:
            pass

        text = buf.decode('utf-8', errors='ignore')

        if state == 'start':
            # Wait for profile selection menu
            if 'production-ios' in text and ('Which build profile' in text or '❯' in text):
                # production-ios might already be selected from saved state
                # Just press Enter if it's already highlighted, or navigate to it
                if '❯' in text.split('production-ios')[0].split('\n')[-1] if 'production-ios' in text else False:
                    os.write(master, b'\r')
                else:
                    # Navigate down to production-ios (last option)
                    for _ in range(5):
                        os.write(master, b'\x1b[B')
                        time.sleep(0.05)
                    os.write(master, b'\r')
                state = 'team'
                buf = b''
                time.sleep(0.5)

        elif state == 'team':
            if 'Individual' in text and '❯' in text:
                if '❯' in text.split('Individual')[0].split('\n')[-1] if 'Individual' in text else False:
                    os.write(master, b'\r')
                else:
                    os.write(master, b'\x1b[B\x1b[B\r')
                state = 'teamid'
                buf = b''
                time.sleep(0.5)

        elif state == 'teamid':
            if 'Apple Team ID' in text:
                # If pre-filled, just Enter; otherwise type it
                if '4G3G5MX9BH' in text:
                    os.write(master, b'\r')
                else:
                    os.write(master, b'4G3G5MX9BH\r')
                state = 'menu'
                buf = b''
                time.sleep(0.5)

        elif state == 'menu':
            if 'All: Set up all' in text and '❯' in text:
                os.write(master, b'\r')
                state = 'linking'
                buf = b''
                time.sleep(1)

        elif state == 'linking':
            # During linking, might get auth error and login prompt
            if 'Apple ID:' in text and 'adrian.stanca1@icloud.com' in text:
                # Pre-filled Apple ID, just press Enter
                os.write(master, b'\r')
                state = 'password'
                buf = b''
                time.sleep(0.5)
            elif 'Apple ID:' in text:
                os.write(master, b'adrian.stanca1@icloud.com\r')
                state = 'password'
                buf = b''
                time.sleep(0.5)
            elif 'Password' in text and 'adrian.stanca1' in text:
                # Password prompt appeared without Apple ID prompt (saved state)
                os.write(master, f'{APPLE_PASSWORD}\r'.encode())
                state = '2fa_or_done'
                buf = b''
                time.sleep(2)

        elif state == 'password':
            if 'Password' in text:
                os.write(master, f'{APPLE_PASSWORD}\r'.encode())
                state = '2fa_or_done'
                buf = b''
                time.sleep(3)

        elif state == '2fa_or_done':
            if 'two-factor' in text.lower() or '2FA' in text or 'verification code' in text.lower() or '6-digit' in text.lower():
                print("\n[2FA REQUIRED] Check your Apple device for 6-digit code and provide it", file=sys.stderr)
                # We can't auto-answer 2FA - need user input
                # But let's wait to see if the prompt passes
                time.sleep(5)
            elif 'Generate a new Apple Developer Program membership certificate' in text:
                os.write(master, b'\r')
                buf = b''
                time.sleep(2)
            elif 'Generate a new Apple Developer Program provisioning profile' in text:
                os.write(master, b'\r')
                buf = b''
                time.sleep(2)
            elif '✔' in text and ('certificate' in text.lower() or 'profile' in text.lower() or 'credentials' in text.lower()):
                print("\n[SUCCESS] Credentials generated successfully!", file=sys.stderr)
                break
            elif 'Press any key' in text or 'Error' in text or 'locked' in text.lower():
                print(f"\n[ERROR/BLOCKED] State: {state}, Text: {text[-200:]}", file=sys.stderr)
                break

        time.sleep(0.1)

    os.waitpid(pid, 0)
    print(f"\n[EXIT] Final state: {state}", file=sys.stderr)

if __name__ == '__main__':
    main()
