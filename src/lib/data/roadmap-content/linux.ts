import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Shell Commands
  // - Permissions
  // - Users
  // - Processes
  // - Networking
  // - grep
  // - awk
  // - sed
  // - ssh
  // - systemd
  // - cron
  // - Logs
 */
export const LinuxContent: RoadmapDetailMap = {
	'Shell Commands': {
		definition:
			'The shell is a command-line interpreter that lets you navigate the filesystem, inspect and manipulate files, and combine small single-purpose programs together using pipes and redirection.',
		useCase:
			'Finding every log file modified in the last day and counting how many contain the word "ERROR" with a single chained command, instead of writing a script.',
		detailedMarkdown: `
# Shell Commands

The Unix philosophy is: write small programs that each do **one thing well**, and let the shell glue them together. That glue is pipes (\`|\`) and redirection (\`>\`, \`>>\`, \`<\`). Interviewers care about this because it signals you can navigate a Linux box quickly without reaching for a full script for every small task — a skill that shows up constantly in debugging production issues.

## Navigation & Inspection
\`\`\`bash
pwd                     # print current working directory
ls -la                  # list all files (including hidden), long format
cd /var/log             # change directory
cat access.log          # dump entire file to stdout
less access.log         # page through a large file (q to quit, / to search)
\`\`\`
Use \`cat\` for small files you want to see all at once; use \`less\` for anything large — it doesn't load the whole file into memory and lets you search interactively.

## Copying, Moving, Deleting
\`\`\`bash
cp app.conf app.conf.bak      # copy a file
cp -r src/ backup/            # copy a directory recursively
mv old-name.txt new-name.txt  # move or rename
rm file.txt                   # delete a file
rm -rf build/                 # delete a directory and its contents (dangerous!)
\`\`\`
\`rm -rf\` is the command every engineer fears typing in the wrong directory — there's no trash can, no undo. Always double-check the path (and consider \`rm -ri\` for a confirmation prompt per file) before running it as root.

## Finding Things: \`find\`
\`\`\`bash
find . -name "*.log"                 # find files by name pattern
find /var/log -mtime -1              # modified in the last 1 day
find . -type f -size +100M           # files larger than 100MB
find . -name "*.tmp" -delete         # find and delete in one shot
\`\`\`

## Pipes: Chaining Small Tools
A pipe (\`|\`) feeds the stdout of one command into the stdin of the next:
\`\`\`bash
cat access.log | grep "ERROR" | wc -l
# -> counts how many lines contain "ERROR"

ps aux | grep java | grep -v grep
# -> lists java processes, excluding the grep command itself
\`\`\`

## Redirection
\`\`\`bash
echo "hello" > out.txt      # overwrite out.txt with "hello"
echo "world" >> out.txt     # append "world" to out.txt
sort names.txt < unsorted.txt   # feed a file in as stdin
command 2> errors.log       # redirect only stderr
command > all.log 2>&1      # redirect both stdout and stderr to the same file
\`\`\`

| Operator | Meaning |
|---|---|
| \`>\` | Redirect stdout, **overwriting** the target file |
| \`>>\` | Redirect stdout, **appending** to the target file |
| \`<\` | Feed a file in as stdin |
| \`\|\` | Pipe stdout of one process into stdin of the next |
| \`2>\` | Redirect stderr specifically |

## Practical Takeaway
Fluency here is what separates "comfortable in a terminal" from "has to Google every command." In interviews and on the job alike, being able to compose \`find\`, \`grep\`, \`wc\`, and a pipe on the fly to answer "how many failed logins were there yesterday?" is a genuinely useful signal of operational maturity.
	`
	},

	Permissions: {
		definition:
			'Linux permissions control who can read, write, or execute a file, tracked as three permission triads — owner, group, and others — each holding a read/write/execute bit.',
		useCase:
			'Locking a private SSH key down to mode 600 so only its owner can read it — SSH itself will refuse to use the key otherwise.',
		detailedMarkdown: `
# Permissions

Every file and directory on Linux has an **owner** (a user), a **group**, and a set of permission bits for three categories: the owner, the group, and everyone else ("others"). Each category gets three bits: **r**ead, **w**rite, **e**xecute.

## Reading \`ls -l\` Output
\`\`\`bash
$ ls -l deploy.sh
-rwxr-xr-- 1 alice devs 1204 Jul  6 10:15 deploy.sh
\`\`\`
Breaking down \`-rwxr-xr--\`:
- Position 1 (\`-\`): file type — \`-\` is a regular file, \`d\` is a directory, \`l\` is a symlink.
- Positions 2-4 (\`rwx\`): **owner** (alice) can read, write, execute.
- Positions 5-7 (\`r-x\`): **group** (devs) can read and execute, not write.
- Positions 8-10 (\`r--\`): **others** can only read.

## Numeric (Octal) Mode
Each triad maps to a number: read=4, write=2, execute=1, summed per category.

| Symbolic | Octal | Meaning |
|---|---|---|
| \`rwx\` | 7 | read + write + execute |
| \`rw-\` | 6 | read + write |
| \`r-x\` | 5 | read + execute |
| \`r--\` | 4 | read only |
| \`---\` | 0 | nothing |

So \`rwxr-xr--\` is octal **754**, and the extremely common "private key" permission \`rw-------\` is octal **600**.

## \`chmod\` — Changing Permissions
\`\`\`bash
chmod 600 id_rsa            # owner: read+write, everyone else: nothing
chmod 755 deploy.sh         # owner: rwx, group & others: r-x (common for scripts)
chmod +x run.sh             # symbolic: add execute for everyone
chmod u+x,g-w run.sh        # symbolic: owner +execute, group -write
chmod -R 644 /srv/static    # recursive: apply to a whole directory tree
\`\`\`
Symbolic mode uses \`u\` (user/owner), \`g\` (group), \`o\` (others), \`a\` (all), combined with \`+\`, \`-\`, or \`=\` and the letters \`r\`, \`w\`, \`x\`.

## \`chown\` — Changing Ownership
\`\`\`bash
chown alice file.txt            # change owner to alice
chown alice:devs file.txt       # change owner to alice, group to devs
chown -R www-data:www-data /var/www   # recursively re-own a directory tree
\`\`\`
Only **root** (or the current owner in limited cases) can change a file's owner — a regular user can't just hand their files to someone else.

## Why Interviewers Ask About This
"SSH refuses my key with 'permissions too open'" and "why does my deployed app get a Permission Denied on a config file" are two of the most common real-world Linux problems, and both come down to this exact model. Being able to read \`ls -l\` output at a glance and fix it with the right \`chmod\`/\`chown\` is a baseline expectation for any backend or DevOps role.

## Practical Takeaway
Default to the **least privilege** that works: \`600\` for secrets, \`644\` for regular files, \`755\` for directories and executables. Never reach for \`777\` — it silently disables the entire permission model and is a common flag in security reviews.
	`
	},

	Users: {
		definition:
			'A Linux user is an account with its own home directory, permissions, and group memberships, tracked centrally in /etc/passwd and /etc/group, with root (UID 0) holding unrestricted privileges.',
		useCase:
			"Creating a dedicated, unprivileged 'deploy' user for a service instead of running it as root, so a compromise of that service can't touch the rest of the system.",
		detailedMarkdown: `
# Users

Every process on Linux runs as some **user**, and every user belongs to one primary **group** plus optionally several supplementary groups. Permissions checks (see the Permissions topic) are ultimately answered in terms of "is the running process's user the owner, in the group, or neither?"

## \`/etc/passwd\`
\`\`\`bash
$ cat /etc/passwd | grep alice
alice:x:1001:1001:Alice Smith:/home/alice:/bin/bash
\`\`\`
Fields, colon-separated: **username** : **password placeholder** (\`x\` means it's actually stored, hashed, in \`/etc/shadow\`) : **UID** : **GID** : **comment/full name** : **home directory** : **login shell**.

## \`/etc/group\`
\`\`\`bash
$ cat /etc/group | grep devs
devs:x:1002:alice,bob
\`\`\`
Group name : password placeholder : GID : comma-separated member usernames.

## root vs. sudo
**root** (UID 0) can bypass every permission check on the system — read/write/execute anything, kill any process, bind any port. Logging in directly as root for daily work is considered bad practice because every mistake (or every compromised shell) is instantly catastrophic.

\`sudo\` ("superuser do") lets an authorized regular user run a **single command** as root (or another user) after re-entering their own password, and every invocation is logged to \`/var/log/auth.log\` (or via \`journalctl\`). This gives you root's power for exactly the command that needs it, with an audit trail, instead of an entire root shell open indefinitely.
\`\`\`bash
sudo systemctl restart nginx     # run one command as root
sudo -u alice ls /home/alice     # run a command as a different, non-root user
sudo -i                          # open an interactive root shell (use sparingly)
\`\`\`
Who's allowed to \`sudo\`, and for which commands, is configured in \`/etc/sudoers\` (edit only via \`visudo\`, which validates syntax before saving).

## Managing Users
\`\`\`bash
sudo useradd -m -s /bin/bash deploy    # create user 'deploy', make a home dir, set shell
sudo passwd deploy                     # set/change their password
sudo usermod -aG docker deploy         # add 'deploy' to the 'docker' group
sudo userdel -r deploy                 # delete the user and their home directory
\`\`\`
The \`-aG\` flag matters: \`-G\` alone **replaces** all supplementary groups, while \`-aG\` **appends** — a very common gotcha.

## Practical Takeaway
Service accounts should be unprivileged, dedicated, and scoped to only the groups they need (e.g. adding a user to the \`docker\` group to run containers without \`sudo\` everywhere). The recurring interview theme is **least privilege**: root and sudo exist so that elevated access is the rare, logged exception, not the default.
	`
	},

	Processes: {
		definition:
			'A process is a running instance of a program, with its own memory space, process ID (PID), and state, which the kernel schedules onto the CPU and which can be inspected, backgrounded, or signaled.',
		useCase:
			'Noticing a runaway process consuming 100% CPU in `top`, then sending it SIGTERM to shut it down gracefully before escalating to `kill -9`.',
		detailedMarkdown: `
# Processes

Every running program is a **process** with a unique **PID**. The kernel's scheduler decides which process gets CPU time and for how long, and tracks each process's current **state**.

## Inspecting Processes
\`\`\`bash
ps aux                    # snapshot of every process on the system
ps aux | grep node        # find processes matching "node"
top                       # live, auto-refreshing view sorted by CPU usage
htop                      # nicer, colorized, interactive version of top (often not preinstalled)
\`\`\`
\`ps aux\` columns worth knowing: **USER** (owner), **PID**, **%CPU**, **%MEM**, **STAT** (state), **START**, **COMMAND**.

## Process States
| State | Meaning |
|---|---|
| **R** — Running | Actively executing or ready to run on the CPU |
| **S** — Sleeping | Waiting on an event (I/O, a timer, a signal) — interruptible |
| **D** — Disk sleep | Waiting on uninterruptible I/O (usually disk) |
| **Z** — Zombie | Finished executing, but its exit status hasn't been read by its parent yet |
| **T** — Stopped | Suspended, usually via a signal like \`SIGSTOP\` or \`Ctrl+Z\` |

A **zombie** isn't consuming CPU or memory beyond its entry in the process table — it's harmless in small numbers, but a huge pile of them signals a parent process that never calls \`wait()\` on its children.

## Foreground, Background, and Job Control
\`\`\`bash
long_running_script.sh &     # start in the background immediately
jobs                         # list background jobs in this shell session
fg %1                        # bring job 1 to the foreground
bg %1                        # resume a stopped job in the background
# Ctrl+Z suspends the current foreground job (state -> T, "stopped")
# Ctrl+C sends SIGINT to the foreground job
\`\`\`

## Sending Signals
\`\`\`bash
kill -l                  # list all signal names
kill 1234                # sends SIGTERM (15) — "please shut down gracefully"
kill -9 1234              # sends SIGKILL (9) — force-kill, cannot be caught or ignored
kill -STOP 1234           # pause the process
killall nginx             # kill every process matching a name
pkill -f "node server.js" # kill by matching the full command line
\`\`\`

| Signal | Number | Can be caught/ignored? | Meaning |
|---|---|---|---|
| \`SIGTERM\` | 15 | Yes | "Please terminate" — the default, graceful request |
| \`SIGKILL\` | 9 | **No** | Immediate termination by the kernel, no cleanup |
| \`SIGINT\` | 2 | Yes | Interrupt, usually from \`Ctrl+C\` |
| \`SIGSTOP\`/\`SIGCONT\` | 19/18 | No/Yes | Pause / resume execution |

## Practical Takeaway
Always try \`SIGTERM\` (the plain \`kill\`) first — it gives the process a chance to flush buffers, close connections, and clean up temp files. Reach for \`kill -9\` only when a process is truly unresponsive, since it gives the process zero chance to clean up, which can corrupt in-flight writes or leave locks held forever.
	`
	},

	Networking: {
		definition:
			'Linux networking commands let you test connectivity, inspect interfaces and routes, and see which processes are listening on which ports.',
		useCase:
			'Diagnosing "connection refused" on a deployed API by checking with `ss` whether anything is actually listening on the expected port.',
		detailedMarkdown: `
# Networking

A handful of commands cover the vast majority of real-world Linux networking debugging: is the host reachable, is the service listening, and where does the traffic actually go.

## Connectivity: \`ping\` and \`traceroute\`
\`\`\`bash
ping -c 4 google.com
# PING google.com (142.250.premises.x): 56 data bytes
# 64 bytes from ...: icmp_seq=0 ttl=115 time=12.3 ms
# ... 4 packets transmitted, 4 received, 0% packet loss

traceroute google.com
# shows every router hop between you and the destination, and how long each takes
\`\`\`
\`ping\` tells you *if* a host is reachable; \`traceroute\` tells you *where* the connection is slow or breaking down along the path.

## HTTP Requests: \`curl\`
\`\`\`bash
curl https://api.example.com/health          # GET request, prints response body
curl -I https://api.example.com               # HEAD request, headers only
curl -X POST -d '{"name":"x"}' -H "Content-Type: application/json" https://api.example.com/users
curl -v https://api.example.com               # verbose: shows the full request/response + TLS handshake
curl -o out.json https://api.example.com/data # save response to a file
\`\`\`

## What's Listening: \`ss\` (modern) / \`netstat\` (classic)
\`\`\`bash
ss -tulnp
# Netid  State   Local Address:Port   Peer Address:Port  Process
# tcp    LISTEN  0.0.0.0:22           0.0.0.0:*          sshd
# tcp    LISTEN  127.0.0.1:5432       0.0.0.0:*          postgres

netstat -tulnp   # same idea, older tool, being phased out on most distros
\`\`\`
Flags: \`-t\` TCP, \`-u\` UDP, \`-l\` listening sockets only, \`-n\` show numeric ports (skip DNS lookups), \`-p\` show the owning process. This is the go-to command for "is anything actually listening on port 8080?"

## Interfaces & Routes: \`ip\` (modern) / \`ifconfig\` (legacy)
\`\`\`bash
ip addr show        # list network interfaces and their IP addresses
ip route show        # show the routing table (default gateway, etc.)
ifconfig             # older equivalent, deprecated on many modern distros
\`\`\`

## DNS Lookups: \`dig\` / \`nslookup\`
\`\`\`bash
dig example.com
# ;; ANSWER SECTION:
# example.com.  86400  IN  A  93.184.216.34

nslookup example.com   # simpler, older alternative to dig
\`\`\`

## Practical Takeaway
The standard debugging ladder for "my service isn't reachable": \`ping\` (is the host up?) -> \`ss -tulnp\` on the server (is the process actually bound to that port?) -> \`curl -v\` (what does the actual HTTP exchange/TLS handshake look like?) -> \`traceroute\` (is the network path itself broken?). Walking through that ladder out loud is exactly what interviewers want to hear for an ops-flavored debugging question.
	`
	},

	grep: {
		definition:
			'grep ("global regular expression print") searches text for lines matching a pattern and prints the matching lines.',
		useCase:
			'Searching an entire codebase for every leftover `TODO` comment, or scanning a production log for every line mentioning a specific error code.',
		detailedMarkdown: `
# grep

\`grep\` is the single most-used text-searching tool on Linux. It reads input line by line and prints every line that matches a given pattern — literal text or a regular expression.

## Basic Usage
\`\`\`bash
grep "ERROR" app.log            # print every line containing "ERROR"
grep -i "error" app.log         # case-insensitive
grep -n "ERROR" app.log         # show line numbers alongside matches
grep -v "DEBUG" app.log         # invert match: print lines that DON'T contain "DEBUG"
grep -c "ERROR" app.log         # count matching lines instead of printing them
\`\`\`

## Searching a Whole Codebase
\`\`\`bash
grep -r "TODO" .                # recursively search every file under the current directory
grep -rn "TODO" --include="*.js" .   # recursive, with line numbers, only .js files
grep -rl "console.log" src/     # -l: print only the FILE NAMES that contain a match, not the lines
grep -rw "user" .               # -w: match whole words only (won't match "username")
\`\`\`
\`-rl\` is genuinely useful in interviews: "find every file that references a deprecated function" is exactly this pattern.

## Regex Power
\`\`\`bash
grep -E "^[0-9]+" file.txt      # -E: extended regex — lines starting with one or more digits
grep "^ERROR" file.txt           # ^ anchors to start of line
grep "failed$" file.txt          # $ anchors to end of line
grep -E "user(name|id)" file.txt # match "username" OR "userid"
grep -o "[0-9]\\\\{3\\\\}-[0-9]\\\\{4\\\\}" file.txt   # -o: print only the matched text, e.g. phone numbers
\`\`\`
Plain \`grep\` uses basic regular expressions, where \`+\`, \`?\`, \`|\`, and \`()\` need backslashes to be "special." \`grep -E\` (or \`egrep\`) switches to extended regex, where those characters work without escaping — almost everyone reaches for \`-E\` rather than remembering the basic-regex escaping rules.

## Piping With Other Commands
\`\`\`bash
ps aux | grep nginx | grep -v grep     # find nginx processes, excluding the grep command itself
cat access.log | grep "500" | wc -l    # count how many requests returned HTTP 500
history | grep "docker run"            # search your shell command history
journalctl -u myapp | grep -i "panic"  # search a systemd service's logs for crashes
\`\`\`
Showing context around a match is often more useful than the bare line:
\`\`\`bash
grep -A 3 -B 1 "Exception" app.log   # 1 line before, 3 lines after each match
\`\`\`

## Practical Takeaway
\`grep\` is the fastest way to answer "does this exist anywhere in this codebase/log?" Master \`-r\` (recursive), \`-n\` (line numbers), \`-i\` (case-insensitive), \`-v\` (invert), and \`-E\` (extended regex) — that combination covers the overwhelming majority of real search tasks, and interviewers frequently probe whether you reach for \`grep\` before writing a script.
	`
	},

	awk: {
		definition:
			'awk is a pattern-scanning and field-based text processing language that splits each input line into fields and lets you compute over, filter, and reformat them.',
		useCase:
			'Summing the total bytes transferred from a web server access log by extracting and adding up one specific column across millions of lines.',
		detailedMarkdown: `
# awk

Where \`grep\` finds lines, \`awk\` **processes** them. It automatically splits each line into whitespace-separated fields (\`$1\`, \`$2\`, ...; \`$0\` is the whole line), which makes it perfect for structured text like logs, CSVs, and \`ps\`/\`ls\` output.

## Printing Fields
\`\`\`bash
$ cat users.txt
alice 29 engineer
bob   34 designer

$ awk '{print $1, $3}' users.txt
alice engineer
bob designer
\`\`\`
\`$1\` is the first field, \`$3\` the third; awk splits on any run of whitespace by default.

## Custom Field Separator
\`\`\`bash
# /etc/passwd is colon-separated: username:x:uid:gid:...
awk -F: '{print $1, $3}' /etc/passwd
# alice 1001
# bob 1002
\`\`\`
\`-F\` sets the field separator — essential for CSV (\`-F,\`) or any delimited format that isn't plain whitespace.

## Filtering With Patterns
\`\`\`bash
awk '$3 > 30' users.txt          # print lines where field 3 is greater than 30
awk '/engineer/' users.txt        # print lines matching a regex, like grep
awk '$1 == "alice" {print $2}' users.txt   # combine a condition with an action
\`\`\`

## Log Analysis: Summing a Column
Given a typical Apache access log where field 10 is response size in bytes:
\`\`\`bash
awk '{sum += $10} END {print "Total bytes:", sum}' access.log
# Total bytes: 48213904
\`\`\`
This is the canonical awk interview example: \`{sum += $10}\` runs on **every line**, accumulating into \`sum\`; \`END {...}\` runs **once**, after all lines are processed, to print the final total.

## Counting Occurrences Per Key
\`\`\`bash
awk '{count[$1]++} END {for (ip in count) print ip, count[ip]}' access.log
# 10.0.0.5 342
# 10.0.0.9 118
\`\`\`
This tallies requests per IP address ($1) using an associative array — a very common "top talkers" style analysis.

## BEGIN / Main / END Structure
\`\`\`bash
awk 'BEGIN {print "Report:"} {total++} END {print "Lines:", total}' file.txt
\`\`\`
- \`BEGIN {}\` — runs once, before any input is read (setup, headers).
- The unlabeled block — runs once per input line (the main loop).
- \`END {}\` — runs once, after all input is consumed (totals, summaries).

## Practical Takeaway
Reach for \`awk\` the moment you need to *do arithmetic or reformat by column* rather than just find lines — summing a byte count, extracting a specific field from structured logs, or tallying counts per key. It's a full language, but 90% of real usage is exactly the three patterns above: print fields, filter by field, accumulate into \`END\`.
	`
	},

	sed: {
		definition:
			'sed ("stream editor") reads text line by line and applies editing commands — most commonly find-and-replace — either printing the result or rewriting the file in place.',
		useCase:
			'Bulk-replacing a hardcoded hostname across dozens of config files in a single command instead of opening each one in an editor.',
		detailedMarkdown: `
# sed

\`sed\` applies an editing script to every line of input as it streams past, without loading the whole file into an editor. The overwhelming majority of real-world usage is one command: substitution.

## The Classic Substitution: \`s/pattern/replacement/flags\`
\`\`\`bash
sed 's/foo/bar/' file.txt        # replace the FIRST "foo" with "bar" on each line
sed 's/foo/bar/g' file.txt        # replace EVERY "foo" with "bar" on each line (global)
sed 's/foo/bar/2' file.txt        # replace only the 2nd occurrence per line
sed 's/foo/bar/gi' file.txt       # global + case-insensitive
\`\`\`
By default \`sed\` prints its output to **stdout** — the original file is untouched unless you tell it otherwise.

## Editing Files In Place: \`-i\`
\`\`\`bash
sed -i 's/localhost/prod-db.internal/g' config.yml   # GNU sed: edit the file directly
sed -i.bak 's/localhost/prod-db.internal/g' config.yml   # keep a backup as config.yml.bak
\`\`\`
> **Gotcha:** on macOS/BSD \`sed\`, \`-i\` **requires** an explicit backup suffix argument (\`sed -i '' 's/.../.../ ' file\` for no backup), while GNU/Linux \`sed\` treats \`-i\` with no argument as "no backup." This trips up almost everyone who's switched between a Mac laptop and a Linux server.

## Bulk Replace Across Many Files
\`\`\`bash
sed -i 's/old_api_key/new_api_key/g' *.env
grep -rl "old_api_key" . | xargs sed -i 's/old_api_key/new_api_key/g'
\`\`\`

## Deleting Lines
\`\`\`bash
sed '/^#/d' config.conf       # delete every line starting with # (comments)
sed '3d' file.txt              # delete line 3
sed '2,4d' file.txt             # delete lines 2 through 4
sed '/^$/d' file.txt            # delete blank lines
\`\`\`

## Printing Specific Lines
\`\`\`bash
sed -n '5,10p' file.txt       # -n suppresses default printing; only print lines 5-10
sed -n '/ERROR/p' app.log      # only print lines matching "ERROR" (like grep, but sed)
\`\`\`

## Using a Different Delimiter
When your pattern contains slashes (e.g. file paths), swap the delimiter to avoid a wall of escaping:
\`\`\`bash
sed 's#/var/old#/var/new#g' file.txt   # using # instead of / as the delimiter
\`\`\`

## grep vs sed vs awk
| Tool | Best for |
|---|---|
| \`grep\` | **Finding** lines that match a pattern |
| \`sed\` | **Transforming** text line by line (substitute, delete, insert) |
| \`awk\` | **Computing** over fields/columns (sums, counts, reformatting) |

## Practical Takeaway
The 90% use case is \`sed -i 's/old/new/g' file\`. Remember the macOS-vs-Linux \`-i\` backup-suffix difference — it's a genuinely common real-world gotcha and a favorite "have you actually used this" interview probe.
	`
	},

	ssh: {
		definition:
			'ssh (Secure Shell) is an encrypted protocol and client for logging into and running commands on a remote machine, most securely via public-key authentication rather than passwords.',
		useCase:
			'Deploying to a production server by SSHing in with a key pair instead of a password, so access can be revoked per-key without changing a shared secret everyone knows.',
		detailedMarkdown: `
# ssh

\`ssh\` gives you an encrypted remote shell (or a way to run a single remote command, or tunnel other traffic) over the network. It's the backbone of essentially all server administration and deployment.

## Basic Login
\`\`\`bash
ssh alice@203.0.113.10                # log in as user 'alice' on that host
ssh alice@203.0.113.10 -p 2222        # connect on a non-default port
ssh alice@203.0.113.10 "uptime"       # run a single remote command and exit
\`\`\`

## Key-Based Authentication
Password auth is disabled on most production servers in favor of **public-key** auth: your private key stays on your machine and never travels over the network; the server only ever needs your matching public key.
\`\`\`bash
ssh-keygen -t ed25519 -C "alice@laptop"
# generates ~/.ssh/id_ed25519 (private, KEEP SECRET) and id_ed25519.pub (public, shareable)

ssh-copy-id alice@203.0.113.10
# appends your public key to the server's ~/.ssh/authorized_keys for you
\`\`\`
The server checks any incoming connection's signature against every key listed in \`~/.ssh/authorized_keys\` for that user. Revoking access for one person is as simple as deleting their line from that file — no shared password to rotate for everyone else.

Two permission rules SSH actively enforces (and will silently refuse to work around):
\`\`\`bash
chmod 700 ~/.ssh                     # only the owner may enter this directory
chmod 600 ~/.ssh/id_ed25519          # private key readable only by its owner
chmod 644 ~/.ssh/authorized_keys     # server-side: owner read/write, others read
\`\`\`

## The Config File: \`~/.ssh/config\`
Instead of typing long flags every time, define an alias:
\`\`\`text
Host prod
    HostName 203.0.113.10
    User alice
    Port 2222
    IdentityFile ~/.ssh/id_ed25519_prod
\`\`\`
Now \`ssh prod\` does everything above in one word — a huge quality-of-life win once you manage more than one or two servers.

## Port Forwarding (Tunneling)
\`\`\`bash
# Local forward: access a remote-only service (e.g. a DB only reachable from the server)
# as if it were running on your own machine, on localhost:5433
ssh -L 5433:localhost:5432 alice@203.0.113.10

# Now on your machine:
psql -h localhost -p 5433 -U dbuser mydb
\`\`\`
\`-L local_port:destination_host:destination_port\` opens a local port that securely tunnels through the SSH connection to a port only reachable from the remote side — extremely handy for reaching a database or admin dashboard that's firewalled off from the public internet but reachable from a bastion host.

## Practical Takeaway
Know the mental model: **private key stays local, public key goes on the server, \`authorized_keys\` is the allowlist.** That single sentence answers most SSH interview questions, and \`-L\` port forwarding is the "bonus" detail that shows real production experience rather than textbook knowledge.
	`
	},

	systemd: {
		definition:
			'systemd is the init system and service manager on most modern Linux distributions, responsible for starting, stopping, restarting, and supervising background services ("units") and collecting their logs.',
		useCase:
			'Defining a unit file for a Node.js API so it starts automatically on boot, restarts itself if it crashes, and has its logs centrally viewable with `journalctl`.',
		detailedMarkdown: `
# systemd

\`systemd\` is PID 1 — the first process the kernel starts, and the one responsible for bringing up (and supervising) everything else, including background services traditionally called "daemons." Its main command-line interface is \`systemctl\`.

## Controlling Services
\`\`\`bash
sudo systemctl start nginx        # start it now
sudo systemctl stop nginx         # stop it now
sudo systemctl restart nginx      # stop then start
sudo systemctl reload nginx       # re-read config without a full restart (if supported)
sudo systemctl status nginx       # is it running? recent log lines, PID, memory
sudo systemctl enable nginx       # start automatically on every future boot
sudo systemctl disable nginx      # stop starting automatically on boot
sudo systemctl enable --now nginx # enable AND start in one command
\`\`\`
A crucial distinction: **enable/disable** controls whether a service starts at boot; **start/stop** controls whether it's running *right now*. A service can be enabled but currently stopped, or running but not enabled — both states are common and interviewers like to probe this exact distinction.

## A Minimal Unit File
Unit files live in \`/etc/systemd/system/\` and describe how to run a service:
\`\`\`ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Node.js API
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/myapp/server.js
Restart=on-failure
RestartSec=5
User=deploy
WorkingDirectory=/opt/myapp
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
\`\`\`
- \`[Unit]\` — metadata and ordering (\`After=\` says "start this after networking is up").
- \`[Service]\` — how to actually run and supervise the process. \`Restart=on-failure\` is what makes systemd self-healing: if the process crashes, systemd restarts it automatically.
- \`[Install]\` — how it hooks into boot targets when enabled.

After creating or editing a unit file:
\`\`\`bash
sudo systemctl daemon-reload         # re-read unit files from disk
sudo systemctl enable --now myapp    # enable on boot and start now
\`\`\`

## Viewing Logs: \`journalctl\`
systemd centralizes every managed service's stdout/stderr into the **journal**, queried with \`journalctl\`:
\`\`\`bash
journalctl -u myapp                # all logs for this one unit
journalctl -u myapp -f              # follow live, like tail -f
journalctl -u myapp --since "1 hour ago"
journalctl -u myapp -n 100          # last 100 lines
journalctl -p err -u myapp          # only error-level and above
\`\`\`

## Practical Takeaway
systemd replaced older init systems (like SysV init/upstart) because it gives services **automatic restart on crash**, **structured centralized logging**, and **dependency ordering** (start the DB before the app that needs it) essentially for free, just by writing a unit file. Being able to write a basic unit file and pull its logs with \`journalctl -u\` is table stakes for any role that touches production Linux servers.
	`
	},

	cron: {
		definition:
			'cron is a time-based job scheduler that runs commands automatically at fixed times, dates, or recurring intervals, defined in a crontab file.',
		useCase:
			'Running a database backup script automatically every night at 2 AM without anyone having to remember to trigger it manually.',
		detailedMarkdown: `
# cron

\`cron\` is a background daemon that wakes up every minute, checks every user's **crontab** (cron table) for jobs due to run, and executes them. It's the standard way to schedule recurring work on Linux — backups, cleanup scripts, report generation, cache warming.

## The 5-Field Syntax
\`\`\`text
*  *  *  *  *  command-to-run
|  |  |  |  |
|  |  |  |  +----- day of week (0-6, Sunday=0, also accepts names like SUN)
|  |  |  +-------- month (1-12)
|  |  +----------- day of month (1-31)
|  +-------------- hour (0-23)
+----------------- minute (0-59)
\`\`\`
An asterisk (\`*\`) means "every value in this field."

## Real Examples
\`\`\`text
0 2 * * *       /home/alice/backup.sh
# run at 2:00 AM, every day

*/15 * * * *    /home/alice/check_health.sh
# run every 15 minutes, every hour, every day (*/N = "every N units")

0 9 * * 1-5     /home/alice/send_report.sh
# run at 9:00 AM, Monday through Friday only

0 0 1 * *       /home/alice/monthly_cleanup.sh
# run at midnight on the 1st of every month

30 3 * * 0      /home/alice/weekly_archive.sh
# run at 3:30 AM every Sunday
\`\`\`

## Managing Your Crontab
\`\`\`bash
crontab -e     # open your crontab in your default editor to add/edit jobs
crontab -l     # list your current crontab entries
crontab -r     # remove your ENTIRE crontab (no confirmation — be careful)
\`\`\`
Each user has their own crontab; system-wide jobs also live in \`/etc/crontab\` and \`/etc/cron.d/\`.

## Common Gotchas
- **No shell environment**: cron jobs run with a minimal environment (often no \`$PATH\` beyond \`/usr/bin:/bin\`), so scripts that work fine interactively can fail silently under cron. Always use full absolute paths inside cron scripts, or explicitly set \`PATH\` at the top of the crontab.
- **Silent failures**: cron emails output to the user's local mailbox by default (often unread/undelivered). Redirect output explicitly so you can actually see failures:
\`\`\`text
0 2 * * *   /home/alice/backup.sh >> /var/log/backup.log 2>&1
\`\`\`
- **Timezone**: cron uses the system's local timezone unless \`CRON_TZ\` is set in the crontab — a frequent source of "why did this run at the wrong time" bugs when servers are in UTC but engineers think in local time.

## Practical Takeaway
Read the 5 fields left to right as **minute hour day-of-month month day-of-week**, and always redirect a cron job's output to a log file — otherwise a silently-failing scheduled job is one of the hardest classes of bugs to notice, since nothing crashes loudly, it just quietly stops doing its job.
	`
	},

	Logs: {
		definition:
			'Linux logs are records of what the system and its services have been doing, traditionally written as plain text files under /var/log or, on modern systemd distributions, stored in the structured, queryable systemd journal.',
		useCase:
			'Live-following an application log with `tail -f` while reproducing a bug, to watch exactly what the service does in the moment it fails.',
		detailedMarkdown: `
# Logs

When something goes wrong on a Linux server, logs are the first place to look. There are two overlapping worlds: traditional flat-file logs under \`/var/log\`, and the structured, binary systemd **journal** queried with \`journalctl\`.

## Where Logs Live: \`/var/log\`
\`\`\`bash
ls /var/log
# syslog        -> general system messages (Debian/Ubuntu)
# auth.log      -> authentication attempts, sudo usage, SSH logins
# kern.log      -> kernel messages
# nginx/        -> web server access + error logs (per-application subdirectory)
# dmesg         -> boot-time and kernel ring buffer messages
\`\`\`
Different distros use slightly different names (\`/var/log/messages\` on RHEL/CentOS instead of \`syslog\`, for example), but the pattern — one file (or directory) per subsystem or app — is consistent.

## Live-Following a Log: \`tail -f\`
\`\`\`bash
tail -f /var/log/nginx/access.log     # stream new lines as they're written
tail -n 100 /var/log/nginx/error.log   # show just the last 100 lines
tail -f app.log | grep --line-buffered "ERROR"   # live-filter for errors only
\`\`\`
\`tail -f\` is the single most common command run while actively reproducing a bug on a live server — you trigger the action in one terminal and watch the log update in real time in another.

## journalctl vs. Traditional Syslog Files
On any systemd-based distro (which is most modern ones), services managed by systemd send their stdout/stderr straight to the **journal** instead of (or in addition to) a flat file:
\`\`\`bash
journalctl                       # entire system journal, oldest first
journalctl -u nginx               # only this one systemd unit's logs
journalctl -f                     # live-follow the whole journal (like tail -f, but structured)
journalctl --since "10 minutes ago"
journalctl -p err                 # only priority "error" and worse
journalctl -k                     # only kernel messages (replaces dmesg for this purpose)
\`\`\`

| | \`/var/log/*.log\` files | systemd journal (\`journalctl\`) |
|---|---|---|
| Format | Plain text | Structured, indexed, often binary |
| Queryable by | \`grep\`/\`awk\`/\`sed\` | Built-in filters (\`-u\`, \`-p\`, \`--since\`) |
| Survives reboot | Yes, until rotated away | Depends on config (\`Storage=\` in journald.conf) |
| Best for | Legacy/non-systemd apps, apps that write their own files | Any systemd-managed service |

## Log Rotation: \`logrotate\`
Logs grow forever unless something prunes them. \`logrotate\` runs periodically (via cron/systemd timer) and, per a config in \`/etc/logrotate.d/\`, compresses old logs, deletes ones past a retention window, and starts a fresh file:
\`\`\`text
/var/log/myapp/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
}
\`\`\`
This keeps 14 days of daily, gzip-compressed logs and silently skips a missing or already-empty log file instead of erroring.

## Practical Takeaway
The standard incident-response reflex is: \`tail -f\` (or \`journalctl -u <service> -f\`) while reproducing the issue, then \`grep\`/\`awk\` over historical logs once you know what pattern to search for. Knowing both worlds — flat files under \`/var/log\` and the structured journal — matters because production fleets are rarely 100% one or the other.
	`
	}
};
