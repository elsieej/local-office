// Kéo asset engine ONLYOFFICE (sdkjs/web-apps/fonts) từ image Docker chính
// thức + x2t.wasm từ cryptpad/onlyoffice-x2t-wasm, ghi vào public/onlyoffice/
// (gitignored — không commit asset nặng vào repo, mỗi máy dev tự chạy lại).
// Version ghim cứng, không dùng latest — xem docs/tasks/19_vendor_pipeline_onlyoffice_task.md.
//
// Chỉ lấy phần cần cho US-9 (xem/sửa .docx): documenteditor (không lấy
// spreadsheet/presentation/pdf/visio editor), sdkjs common+word (không lấy
// cell/slide/pdf/visio), bỏ resources/help (tài liệu trợ giúp đa ngôn ngữ,
// ngoài phạm vi), bỏ locale ngoài vi/en, bỏ vendor/monaco (trình soạn macro,
// ngoài phạm vi), bỏ bản build riêng cho IE.
//
// Yêu cầu máy dev: Docker, unzip (có sẵn trên Git Bash/macOS/Linux).

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

const DS_IMAGE = 'onlyoffice/documentserver:9.3.0.1'
const X2T_RELEASE_TAG = 'v9.3.0+0'
const X2T_ZIP_URL = `https://github.com/cryptpad/onlyoffice-x2t-wasm/releases/download/${encodeURIComponent(X2T_RELEASE_TAG)}/x2t.zip`
const X2T_SHA512 =
  'e82fbf21fcdcff2cbaca5b9a49c3a3d6bc5f5f02ba9b704a7384ceb91e17e979bf7659aaf59f677edf319fde91dd847b419e018f58f38eb1df6ab433a6cd207c'

const ROOT = new URL('..', import.meta.url).pathname.replace(
  /^\/([A-Za-z]):/,
  '$1:',
)
const OUT_DIR = join(ROOT, 'public', 'onlyoffice')
const CONTAINER = 'local-office-vendor-onlyoffice'

function run(cmd, args, opts = {}) {
  console.log('$', cmd, args.join(' '))
  return execFileSync(cmd, args, { stdio: 'inherit', ...opts })
}

function dockerCp(fromPath, toPath) {
  mkdirSync(toPath, { recursive: true })
  run('docker', ['cp', `${CONTAINER}:${fromPath}`, toPath])
}

function dirSizeBytes(path) {
  const stat = statSync(path)
  if (!stat.isDirectory()) return stat.size
  let total = 0
  for (const entry of readdirSync(path)) {
    total += dirSizeBytes(join(path, entry))
  }
  return total
}

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

console.log('== 1/5: dọn thư mục đích ==')
rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

console.log('== 2/5: kéo image + sinh font ==')
run('docker', ['pull', DS_IMAGE])
run('docker', ['rm', '-f', CONTAINER], { stdio: 'ignore' })
run('docker', [
  'run',
  '-d',
  '--name',
  CONTAINER,
  DS_IMAGE,
  'tail',
  '-f',
  '/dev/null',
])
run('docker', [
  'exec',
  CONTAINER,
  'documentserver-generate-allfonts.sh',
  'false',
])

console.log('== 3/5: copy asset đã lọc ra khỏi container ==')
const DS_ROOT = '/var/www/onlyoffice/documentserver'
dockerCp(`${DS_ROOT}/sdkjs/common`, join(OUT_DIR, 'sdkjs'))
dockerCp(`${DS_ROOT}/sdkjs/word`, join(OUT_DIR, 'sdkjs'))
dockerCp(`${DS_ROOT}/web-apps/apps/api`, join(OUT_DIR, 'web-apps', 'apps'))
dockerCp(`${DS_ROOT}/web-apps/apps/common`, join(OUT_DIR, 'web-apps', 'apps'))
dockerCp(
  `${DS_ROOT}/web-apps/apps/documenteditor/main`,
  join(OUT_DIR, 'web-apps', 'apps', 'documenteditor'),
)
dockerCp(`${DS_ROOT}/web-apps/vendor`, join(OUT_DIR, 'web-apps'))
dockerCp(`${DS_ROOT}/fonts`, OUT_DIR)

run('docker', ['rm', '-f', CONTAINER])

console.log('== 4/5: cắt bớt phần không cần cho US-9 ==')
const mainDir = join(OUT_DIR, 'web-apps', 'apps', 'documenteditor', 'main')
rmSync(join(mainDir, 'resources', 'help'), { recursive: true, force: true })
rmSync(join(mainDir, 'ie'), { recursive: true, force: true })
for (const file of readdirSync(join(mainDir, 'locale'))) {
  if (!file.startsWith('vi.') && !file.startsWith('en.')) {
    rmSync(join(mainDir, 'locale', file), { force: true })
  }
}
for (const file of readdirSync(mainDir)) {
  if (file.endsWith('.gz')) rmSync(join(mainDir, file), { force: true })
}
rmSync(join(OUT_DIR, 'web-apps', 'vendor', 'monaco'), {
  recursive: true,
  force: true,
})

console.log('== 5/5: tải + xác minh + giải nén x2t.wasm ==')
const zipPath = join(OUT_DIR, 'x2t.zip')
run('curl', ['-sL', '-o', zipPath, X2T_ZIP_URL])
const hash = createHash('sha512').update(readFileSync(zipPath)).digest('hex')
if (hash !== X2T_SHA512) {
  throw new Error(
    `Checksum x2t.zip không khớp!\n  mong đợi: ${X2T_SHA512}\n  thực tế:  ${hash}`,
  )
}
console.log('checksum x2t.zip khớp:', hash)
const x2tDir = join(OUT_DIR, 'x2t')
mkdirSync(x2tDir, { recursive: true })
run('unzip', ['-o', '-q', zipPath, '-d', x2tDir])
rmSync(zipPath, { force: true })

writeFileSync(
  join(OUT_DIR, 'VENDORED.json'),
  JSON.stringify(
    {
      documentServerImage: DS_IMAGE,
      x2tReleaseTag: X2T_RELEASE_TAG,
      x2tSha512: X2T_SHA512,
      vendoredAt: new Date().toISOString(),
    },
    null,
    2,
  ) + '\n',
)

console.log('\n== Xong. Dung lượng cuối: ==')
if (existsSync(OUT_DIR)) {
  console.log(formatMB(dirSizeBytes(OUT_DIR)), OUT_DIR)
  for (const entry of readdirSync(OUT_DIR)) {
    const p = join(OUT_DIR, entry)
    if (statSync(p).isDirectory())
      console.log(' ', formatMB(dirSizeBytes(p)), entry)
  }
}
