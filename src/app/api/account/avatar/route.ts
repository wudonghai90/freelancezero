import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, unauthorized, handle } from '@/lib/api';
import { recomputeCompleteness } from '@/lib/profile-completeness';

const TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

/** POST /api/account/avatar — upload/replace the signed-in user's photo. */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const file = (await req.formData()).get('file');
    if (!(file instanceof File)) return fail('请选择要上传的图片', 422);
    const ext = TYPES[file.type];
    if (!ext) return fail('仅支持 PNG、JPG 或 WebP 图片', 422);
    if (file.size > 2 * 1024 * 1024) return fail('图片大小不能超过 2 MB', 422);

    const dir = path.resolve(process.env.STORAGE_LOCAL_DIR ?? './uploads', 'avatars');
    await mkdir(dir, { recursive: true });

    // Replace any previous avatar for this user.
    for (const f of await readdir(dir)) {
      if (f.startsWith(`${session.user.id}-`)) {
        await unlink(path.join(dir, f)).catch(() => {});
      }
    }

    const name = `${session.user.id}-${Date.now()}${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

    const url = `/uploads/avatars/${name}`;
    await db.user.update({ where: { id: session.user.id }, data: { image: url } });
    // A photo is worth real points on the completeness score.
    await recomputeCompleteness(session.user.id);
    return ok({ image: url });
  });
}
