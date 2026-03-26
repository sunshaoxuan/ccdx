import os
import sys
import posixpath
import paramiko


HOSTNAME = "vmsnode.briconbric.com"
USERNAME = "root"
PASSWORD = "BtZhY1^3"
REMOTE_ROOT = "/var/www/ccdx"


def ensure_remote_dir(sftp, remote_dir):
    parts = remote_dir.strip("/").split("/")
    current = "/"
    for part in parts:
        current = posixpath.join(current, part)
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/remote_sync.py <file> [file...]")
        sys.exit(1)

    local_files = sys.argv[1:]

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        sftp = ssh.open_sftp()

        for local_path in local_files:
            rel_path = os.path.relpath(os.path.abspath(local_path), os.getcwd())
            remote_path = posixpath.join(REMOTE_ROOT, rel_path.replace(os.sep, "/"))
            ensure_remote_dir(sftp, posixpath.dirname(remote_path))
            sftp.put(local_path, remote_path)
            print(f"uploaded {rel_path} -> {remote_path}")

        sftp.close()
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
