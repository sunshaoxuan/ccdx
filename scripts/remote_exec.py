import os
import sys
import paramiko


HOSTNAME = "vmsnode.briconbric.com"
USERNAME = "root"
PASSWORD = "BtZhY1^3"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/remote_exec.py '<command>'")
        sys.exit(1)

    command = sys.argv[1]

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        stdin, stdout, stderr = ssh.exec_command(command)
        exit_code = stdout.channel.recv_exit_status()

        out = stdout.read().decode()
        err = stderr.read().decode()

        if out:
            print(out, end="" if out.endswith("\n") else "\n")
        if err:
            print(err, end="" if err.endswith("\n") else "\n", file=sys.stderr)

        sys.exit(exit_code)
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
