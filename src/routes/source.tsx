import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { GIT_COMMIT_SHA, REPO_URL } from '#/constants/build-info'

export const Route = createFileRoute('/source')({
  component: SourcePage,
})

function SourcePage() {
  const commitUrl = GIT_COMMIT_SHA ? `${REPO_URL}/tree/${GIT_COMMIT_SHA}` : null

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <Card>
        <CardHeader>
          <Badge variant="secondary">AGPL-3.0</Badge>
          <CardTitle className="font-display text-3xl leading-tight sm:text-4xl">
            Tải mã nguồn
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-base leading-8">
            LocalOffice là phần mềm mã nguồn mở theo giấy phép{' '}
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              GNU Affero General Public License v3.0
            </a>
            . Giấy phép này yêu cầu: bất kỳ ai tương tác với LocalOffice qua
            mạng (kể cả chỉ dùng qua trình duyệt, không tải file nào về) đều có
            quyền lấy đầy đủ mã nguồn của đúng bản đang chạy.
          </p>

          <div className="bg-muted rounded-lg border p-4">
            <p className="text-sm font-medium">Bản đang chạy</p>
            {commitUrl ? (
              <a
                href={commitUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm underline underline-offset-4"
              >
                {GIT_COMMIT_SHA}
              </a>
            ) : (
              <p className="text-muted-foreground text-sm">
                Không xác định được commit (bản build không đi qua{' '}
                <code>git</code>).
              </p>
            )}
          </div>

          <p className="text-muted-foreground text-sm leading-7">
            Toàn bộ mã nguồn — kể cả phần tích hợp engine tài liệu ONLYOFFICE —
            nằm ở{' '}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              {REPO_URL}
            </a>
            . Tự dựng lại đúng bản này (bao gồm bước{' '}
            <code>npm run vendor:onlyoffice</code>, cần Docker) theo hướng dẫn ở{' '}
            <code>docs/TECHSTACK.md</code> trong repo.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
