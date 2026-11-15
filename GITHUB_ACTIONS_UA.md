# Каталог настільних ігор — запуск через GitHub Actions

Проєкт автоматично збирається на кожен pull request і публікується у Cloudflare Workers після push у гілку `main` або ручного запуску workflow.

## 1. Створи репозиторій

1. Розпакуй архів.
2. Створи порожній репозиторій на GitHub.
3. Завантаж усі файли з папки проєкту в корінь репозиторію.

```bash
git init
git add .
git commit -m "Add board games catalog"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

## 2. Підготуй Cloudflare

Потрібен безкоштовний або платний обліковий запис Cloudflare. Встанови Node.js 22 і виконай:

```bash
corepack enable
pnpm install
pnpm wrangler login
pnpm wrangler d1 create board-games-catalog-db
pnpm wrangler r2 bucket create board-games-catalog-images
```

Команда створення D1 покаже `database_id`. Збережи його — він потрібен у GitHub.

Створи Cloudflare API Token з дозволами:

- Account → Workers Scripts → Edit
- Account → D1 → Edit
- Account → Workers R2 Storage → Edit

## 3. Додай GitHub Secrets

У репозиторії відкрий **Settings → Secrets and variables → Actions**.

Додай в **Secrets**:

| Назва | Значення |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API Token із Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID із Cloudflare Dashboard |
| `D1_DATABASE_ID` | ID бази `board-games-catalog-db` |
| `CATALOG_PIN` | PIN для входу в режим редагування, наприклад `459593` |
| `CATALOG_SESSION_SECRET` | Довгий випадковий секрет, щонайменше 32 символи |

Згенерувати секрет можна командою:

```bash
openssl rand -hex 32
```

Додай в **Variables**:

| Назва | Значення |
|---|---|
| `WORKER_NAME` | `board-games-catalog` або інша унікальна назва |
| `R2_BUCKET_NAME` | `board-games-catalog-images` |

## 4. Запусти публікацію

Відкрий вкладку **Actions**, вибери **Build and deploy catalog** і натисни **Run workflow**. Також workflow запускається автоматично після push у `main`.

Наприкінці кроку `Deploy` з’явиться адреса виду:

```text
https://board-games-catalog.<твій-subdomain>.workers.dev
```

## Локальний запуск

```bash
corepack enable
pnpm install
pnpm build
```

Для повноцінного локального запуску з базою та фото потрібно налаштувати локальні D1/R2 bindings через Wrangler. Найпростіше спочатку опублікувати проєкт через GitHub Actions.

## Важливо про дані

Cloudflare-версія використовуватиме нову порожню базу. Ігри та фотографії з уже опублікованого каталогу автоматично не переносяться. Після першого запуску їх можна додати через інтерфейс.
