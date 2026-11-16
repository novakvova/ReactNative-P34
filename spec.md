# Specification: ReactNative-P34 (Salo)

Технічна специфікація проєкту: структура, стек, залежності, архітектура, ризики.
Оновлювати при суттєвих змінах архітектури або стеку.

Останнє оновлення: 2026-11-16.

---

## 1. Огляд

Репозиторій містить мобільний клієнт і серверну частину простого сервісу автентифікації користувачів із профілем та аватаром.

| Компонент | Призначення | Статус |
|---|---|---|
| `app/` | Мобільний/веб клієнт (Expo, React Native) | Активна розробка |
| `WebAPISalo/` | REST API (ASP.NET Core 9) + Identity + PostgreSQL + SMTP (відновлення пароля) | Активна розробка |
| `AndroidApp/` | Android-застосунок на Java (шаблон "Empty Views Activity") | Не пов'язаний з API, ігнорувати |
| `salo.itstep.click/` | Docker Compose для продакшену (API, PostgreSQL, бекапи) | Продакшен |
| `build_and_push.bat` | Збірка і публікація Docker-образу API | Продакшен |

Продакшен-домен: `https://salo.itstep.click` (nginx → `localhost:8254` → контейнер API).

---

## 2. Структура репозиторію

```
ReactNative-P34/
├── app/                      # Expo-клієнт
│   ├── src/app/              # Expo Router (файлові маршрути)
│   │   ├── _layout.tsx       # Кореневий layout: відновлення сесії, Redux Provider
│   │   ├── index.tsx         # Редірект: /profile або /login
│   │   ├── (auth)/login.tsx, register.tsx, forgot-password.tsx, reset-password.tsx
│   │   ├── (profile)/profile.tsx, _layout.tsx
│   │   ├── chat/_layout.tsx  # Група чату: KeyboardAwareScrollView + Stack (екранів ще немає)
│   │   ├── mychat.tsx        # Чат через SignalR (хаб /chat, ChatHub)
│   │   └── explore.tsx       # Залишок шаблону Expo
│   ├── src/store/            # Redux Toolkit: store + AuthSlice
│   ├── src/schemas/          # zod-схеми форм (Login, Register, Profile, ForgotPassword, ResetPassword)
│   ├── src/api/              # config.ts (API_BASE_URL), baseQuery.ts, apiSlice.ts (RTK Query: login, register, forgotPassword, resetPassword), apiErrors.ts
│   ├── src/types/            # TypeScript-інтерфейси (IUser, IAuthResponse, ...)
│   ├── src/components/       # UI-компоненти (частина — шаблон Expo)
│   ├── src/hooks/, constants/, global.css
│   ├── app.json, babel.config.js, metro.config.js, tailwind.config.js, tsconfig.json
│   ├── AGENTS.md             # Правила для AI-агентів щодо Expo/EAS
│   └── package.json, package-lock.json (npm)
├── WebAPISalo/
│   ├── WebAPISalo.slnx
│   ├── Dockerfile            # Multi-stage: SDK 9 → ASP.NET 9 runtime
│   └── WebAPISalo/
│       ├── Program.cs        # Композиція DI, JWT, Swagger, статика, seed
│       ├── Controllers/      # AccountController, ChatsController (+ WeatherForecast — шаблон)
│       ├── Hubs/             # ChatHub (/chat, анонімний), MyChatHub (/hub/chat, з БД)
│       ├── Services/         # ImageService, JwtTokenService, EmailService, ChatService, IdentityService, InviteTokenService
│       ├── Interfaces/       # IImageService, IJwtTokenService, IEmailService, IChatService, IIdentityService
│       ├── Data/             # MyDbContext, Identity-сутності, Chat-сутності (Data/Chat)
│       ├── Mapper/           # ChatMapper (Riok.Mapperly)
│       ├── Migrations/       # EF Core-міграції (AddIdentityTabels)
│       ├── EmailTemplates/   # PasswordResetCode.html (плейсхолдери {{Email}}, {{Code}})
│       ├── Models/Account/   # LoginModel, RegisterModel, ForgotPasswordModel, ResetPasswordModel (DTO)
│       ├── Models/Settings/  # SmtpSettings (блок Smtp з appsettings.json)
│       ├── Models/Chat/      # DTO чату: ChatCreateModel, ChatEditModel, SendMessageModel, UserSearchModel та інші
│       ├── Constants/        # Roles, ChatTypes
│       ├── images/           # Приклад збережених WebP-зображень
│       └── appsettings*.json
├── AndroidApp/               # Gradle-проєкт, Java, package com.example.myfristapp
├── salo.itstep.click/        # docker-compose.yml, .env (секрети — не коміть значення)
├── build_and_push.bat
├── README.md                 # Налаштування nginx + certbot
├── CLAUDE.md                 # Інструкції для Claude Code
└── spec.md                   # Цей файл
```

`test-chat/` (у корені репозиторію) містить лише `index.html` — статичний приклад чату на SignalR. Клієнт чату в застосунку — `app/src/app/mychat.tsx`.

Зауваження: батьківська директорія `40.ReactNative P34/` містить `HomeWork*.txt` та інші навчальні файли, які не належать до проєкту.

---

## 3. Технологічний стек

### 3.1 Клієнт (`app/`)

| Категорія | Технологія | Версія (package.json) |
|---|---|---|
| Платформа | Expo SDK | `expo ~58.0.16` |
| UI-рантайм | React Native | `0.88.0` |
| UI-бібліотека | React | `19.3.0` (`reactCompiler: true` в `app.json`) |
| Навігація | Expo Router (file-based, `typedRoutes: true`) | `~58.0.24` |
| Стилі | NativeWind + Tailwind CSS | `nativewind ^4.2.7`, `tailwindcss ^3.4.19` |
| Стан | Redux Toolkit + react-redux | `@reduxjs/toolkit ^2.13.0`, `react-redux ^9.3.1` |
| Форми | react-hook-form + zod + @hookform/resolvers | `^7.90.0`, `zod ^4.6.7`, `^5.9.2` |
| HTTP | axios | `^1.20.0` |
| JWT | jwt-decode | `^4.0.0` |
| Збереження токена | expo-secure-store | `^15.0.8` |
| Вибір фото | expo-image-picker | `^17.0.10` |
| Multipart | object-to-formdata | `^5.0.0` |
| Чат (реального часу) | @microsoft/signalr | `^10.0.11` |
| Анімації/жести | react-native-reanimated, react-native-gesture-handler, react-native-worklets | `^4.7.1`, `~3.3.0`, `0.13.0` |
| Веб-таргет | react-native-web, react-dom | `~0.21.4`, `19.3.0` (`web.output: "server"`) |
| Мова | TypeScript (strict) | `~6.0.3` |
| Інструменти | prettier-plugin-tailwindcss, @expo/ngrok, expo-doctor (через npx) | dev |

Інші Expo-модулі: expo-constants, expo-device, expo-font, expo-glass-effect, expo-image, expo-linking, expo-splash-screen, expo-status-bar, expo-symbols, expo-system-ui, expo-web-browser, @expo/ui. Додатково: react-native-keyboard-controller `1.22.7` (у `chat/_layout.tsx`), react-native-safe-area-context `~5.10.1`, expo-file-system `~58.0.13` (фото в реєстрації).

### 3.2 Бекенд (`WebAPISalo/`)

| Категорія | Технологія | Версія |
|---|---|---|
| Рантайм | .NET / ASP.NET Core | `net9.0` |
| ORM | EF Core + Npgsql | `Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4`, EF Tools `9.0.21` |
| Ідентичність | ASP.NET Core Identity (EF Core store) | `Microsoft.AspNetCore.Identity.EntityFrameworkCore 9.0.21` |
| Автентифікація | JWT Bearer (HS256) | `Microsoft.AspNetCore.Authentication.JwtBearer 9.0.22` |
| Зображення | SkiaSharp (+ Linux native assets) | `4.154.0` |
| API-документація | Swashbuckle (Swagger UI) | `9.0.6` |
| База даних | PostgreSQL | `postgres:18.1` (Docker) |
| Пошта | MailKit (SMTP), `MailKit 4.18.2`. Сервер `smtp.ukr.net`, конфіг у секції `Smtp` | `4.18.2` |

### 3.3 Android (`AndroidApp/`) — не пов'язаний з API

- AGP `9.4.1`, minSdk 24, targetSdk/compileSdk 37, Java 11.
- AndroidX AppCompat 1.6.1, Material 1.10.0, ConstraintLayout 2.1.4, Activity KTX 1.8.0.
- Тести: JUnit 4.13.2, Espresso 3.5.1 (лише шаблонні `ExampleUnitTest`/`ExampleInstrumentedTest`).
- Одна `MainActivity` з `activity_main.xml`, без логіки API.

### 3.4 Інфраструктура

- Docker: образ `novakvova/salo-api:latest` (збірка через `build_and_push.bat`).
- `docker-compose.yml`: сервіси `postgresSaloServerDb` (порт 5212→5432), `api` (порт 8254→8080), `db-backup` (щоденний `pg_dump` у `./backups`).
- nginx на хості: proxy `salo.itstep.click` і `*.salo.itstep.click` на `localhost:8254`, `client_max_body_size 200M`, TLS через certbot.
- Збірка мобільного клієнта: EAS (`eas build`, `eas submit`, `eas update`), згідно з `app/AGENTS.md`.

---

## 4. Архітектурні рішення

### 4.1 Клієнт

**Шари:**

1. **Маршрутизація** — Expo Router. Групи `(auth)` і `(profile)`. Редірект у `index.tsx` залежить від наявності `user` у Redux.
2. **Стан** — один Redux-слайс `auth` (`AuthSlice.ts`). Зберігає декодовані JWT-claims (`IUser`) разом із сирим `token`.
3. **Персистентність** — токен у `expo-secure-store` під ключем `"token"`. Відновлення сесії — у кореневому `_layout.tsx` при старті (dispatch `loginSuccess`).
4. **Форми** — react-hook-form з zod-валідацією (`src/schemas/`).
5. **Мережа** — RTK Query (`src/api/apiSlice.ts`, endpoints `login`, `register`, `forgotPassword`, `resetPassword`) на базовому запиті `src/api/baseQuery.ts`. Базовий запит додає `Authorization`, якщо користувач увійшов. Базова адреса — `API_BASE_URL` у `src/api/config.ts`. `profile.tsx` не робить запитів: аватар формується з `API_BASE_URL`, збереження профілю ще не реалізоване (submit — заглушка). `src/api/requestLogger.ts` логує HTTP лише в `__DEV__` і маскує паролі, токени та коди.
6. **Стилі** — NativeWind: класи Tailwind через `className`; кольори в основному `slate`/`indigo`.

**Потік автентифікації:**

```
Login.tsx ──POST /api/Account/Login {email,password}──▶ API
          ◀──────────── 200 { token } ──────────────────
          SecureStore.set("token", token)
          dispatch(loginSuccess(token))  → decode JWT → state.auth.user
          router.push("/profile")

App start: _layout.tsx → SecureStore.get("token") → dispatch(loginSuccess)
Logout:    profile.tsx → SecureStore.delete("token") → dispatch(logout) → /login
```

**Модель клієнта:** `IUser { email, name, roles[], image, exp, token }`. Поля беруться з claims JWT (`email`, `name`, `roles`, `image`, `exp`).

**Відновлення пароля (клієнт):** `login.tsx` → посилання «Забули пароль?» → `forgot-password.tsx` → `reset-password.tsx` (email передається параметром маршруту). `login.tsx` показує помилку для статусів 400 і 401. Текст береться з поля `error` відповіді.

**Чат (клієнт):** `app/src/app/mychat.tsx`, маршрут `/mychat`. Підключається до `CHAT_HUB_URL` (`src/api/config.ts`), слухає подію `Send`, викликає `Send`. Стан з'єднання показується в шапці (`connecting`, `connected`, `disconnected`). Повідомлення відображаються від нових до старих у `FlatList` з `inverted`. Вхід у чат — кнопка «Перейти в чат» на `profile.tsx` (`router.replace("/mychat")`). Кнопки повернення з чату немає. Клієнт досі підключений до `/chat`; `MyChatHub` на `/hub/chat` клієнтом ще не використовується. Екран `app/src/app/chat/home.tsx` — головна чату: картка користувача з Redux (фото, ім'я, email), привітання, кнопки «Створити новий чат» (`/chat/create`) і «Додатися в чат» (`/chat/join`), кнопка налаштувань ліворуч вгорі (`/profile`). `chat/create.tsx` і `chat/join.tsx` — заглушки («ще в розробці»).

### 4.2 Бекенд

**Шари:**

1. **Контролери** — `AccountController` з маршрутами `api/Account/{Login|Register|GetAll|ForgotPassword|ResetPassword}`; `ChatsController` (`api/Chats`, `[Authorize]`) для чатів: створення, редагування, типи, пошук користувачів, мої чати, повідомлення, перевірка адміна, invite-посилання.
2. **Сервіси** — `JwtTokenService` (видача токена), `ImageService` (обробка зображень), `EmailService` (SMTP через MailKit). Реєструються як `Scoped`, інтерфейси в `Interfaces/`. Чат: `ChatService` (`IChatService`), `IdentityService` (`IIdentityService`, бере email з першого claim-а), `ChatMapper` (Singleton, Mapperly). `InviteTokenService` без інтерфейсу і без реєстрації в DI, створюється через `new` (див. ризик #27). `SmtpSettings` прив'язується через `IOptions` у `Program.cs`.
3. **Ідентичність** — `UserManager`/`RoleManager` ASP.NET Identity; сутності `UserEntity : IdentityUser<long>`, `RoleEntity`, `UserRoleEntity`.
4. **Персистентність** — `MyDbContext : IdentityDbContext<…, long, …>` з PostgreSQL. Міграції застосовуються при старті.
5. **Статика** — `images/` віддається за `/images` через `UseStaticFiles`.
6. **Документація** — Swagger з Bearer-схемою, XML-коментарі (`GenerateDocumentationFile`).
7. **Хаб** — `ChatHub` (SignalR), `MapHub<ChatHub>("/chat")`. Метод `Send(string message)` розсилає повідомлення через подію `Send` усім підключеним клієнтам. Автентифікації немає, повідомлення не зберігаються.
   `MyChatHub` (`MapHub<MyChatHub>("/hub/chat")`): `JoinChat(chatId)` перевіряє членство і додає в групу `chat-{id}`; `SendMessage(SendMessageModel)` зберігає повідомлення в БД і розсилає подію `ReceiveMessage` групі; `LeaveChat(chatId)`. `[Authorize]` немає.

**Конвеєр запиту:** `UseCors` → `MapHub<ChatHub>("/chat")` → статика → `UseSwagger/UseSwaggerUI` → `UseAuthentication` → `UseAuthorization` → `MapControllers`.

**CORS:** політика за замовчуванням дозволяє будь-який origin разом з credentials (`SetIsOriginAllowed(_ => true)`, `AllowAnyHeader`, `AllowAnyMethod`, `AllowCredentials`). Потрібно для SignalR з веб-клієнта.

**Налаштування Identity:** довжина пароля ≥ 6, без інших вимог. Email використовується як `UserName`. `EmailConfirmed = true` (підтвердження пошти не реалізоване).

**JWT:**
- Підпис HS256, ключ з `Jwt:Key` (`appsettings.json`).
- Термін дії 7 днів, `ClockSkew = 0`, `ValidateIssuer/Audience = false`.
- Claims: `email`, `name` (`"{LastName} {FirstName}"`), `image` (GUID зображення), `roles` (по одному на роль).

**Ролі:** `Admin`, `User` (`Constants/Roles.cs`). Нові користувачі отримують `User`. Сід створює `admin@gmail.com` та `user@gmail.com`, якщо таблиця користувачів порожня. Сід також заповнює `tblChatTypes` (`Private`, `Group`), якщо таблиця порожня.

### 4.3 Модель даних

Схема Identity (PostgreSQL, EF Core):

| Таблиця | Опис |
|---|---|
| `AspNetUsers` | `UserEntity`: `Id (long)`, `UserName`, `Email`, пароль-хеш, `FirstName`, `LastName`, `Image` (GUID), `DateCreated` (UTC) |
| `AspNetRoles` | `RoleEntity`: `Admin`, `User` |
| `AspNetUserRoles` | `UserRoleEntity` (зв'язок користувач–роль) |
| `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens`, `AspNetRoleClaims` | Стандартні таблиці Identity (не використовуються явно) |

Міграції: `20261024170414_AddIdentityTabels`, далі п'ять чат-міграцій від 2026-11-14 (`AddChatTypes`, `AddChatTable`, `AddChatUserTable`, `AddChatMessagesTable`, `AddChatMessageReadsTabels`).

Чат-таблиці (EF Core, `Data/Chat`):

| Таблиця | Опис |
|---|---|
| `tblChatTypes` | `ChatTypeEntity`: `Name` (`Private`, `Group`) |
| `tblChats` | `ChatEntity`: `Name` (до 200), `ChatTypeId` |
| `tblChatUsers` | `ChatUserEntity`: складений ключ `(ChatId, UserId)`, `IsAdmin`, `JoinedAt` |
| `tblChatMessages` | `ChatMessageEntity`: `Message` (до 1000), `UserId`, `ChatId`, `FileUrl`, `ReplyToMessageId`, `IsEdited` |
| `tblChatMessageReads` | `ChatMessageReadEntity`: складений ключ `(MessageId, UserId)`, `ReadAt` |

### 4.4 Обробка зображень

1. Клієнт вибирає фото (`expo-image-picker`), передає як multipart (`ImageFile`).
2. `ImageService` декодує через SkiaSharp і паралельно зберігає WebP у розмірах з `ImageSizes` (зараз `64, 432, 800, 1280`) з бічною стороною, не більшою за розмір.
3. Файли: `images/{GUID}_{size}.webp`. GUID записується в `UserEntity.Image` і в JWT-claim `image`.
4. Клієнт формує URL з GUID і потрібним розміром. Логіка формування URL у клієнті ще не реалізована або лежить поза цим репозиторієм.

Файли лежать на локальній файловій системі контейнера (`Directory.GetCurrentDirectory()`). Для зберігання поза контейнером потрібен volume (зараз `VOLUME_SERVERAPI` у `.env`).

### 4.5 Конфігурація

| Джерело | Ключі |
|---|---|
| `appsettings.json` | `Jwt:Key`, `ConnectionStrings:DefaultConnection` (порожній), `ImagesDir`, `ImageSizes`, `Smtp:Host`, `Smtp:Port` (2525), `Smtp:UserName`, `Smtp:Password` |
| Змінні середовища (Docker) | `ConnectionStrings__DefaultConnection`, `ASPNETCORE_ENVIRONMENT=Production` |
| Рекомендовано для секретів | `Smtp__Password` і `Jwt__Key` як змінні середовища замість значень у файлі |
| `salo.itstep.click/.env` | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `VOLUME_POSTGRES`, `VOLUME_SERVERAPI` |
| Клієнт | Немає env-конфігурації. Базова адреса в `src/api/config.ts` (`API_BASE_URL`). `CHAT_HUB_URL` у тому самому файлі; `profile.tsx` бере базу з `API_BASE_URL` |

### 4.6 Відновлення пароля

Потік на бекенді (`AccountController`):

```
POST /api/Account/ForgotPassword { email }
  → FindByEmailAsync
  → GenerateUserTokenAsync(user, DefaultEmailProvider, "ResetPassword")   → 6-значний код
  → EmailService.SendPasswordResetCodeAsync → EmailTemplates/PasswordResetCode.html
  → 200 (однакова відповідь, незалежно від наявності email)

POST /api/Account/ResetPassword { email, code, newPassword }
  → VerifyUserTokenAsync(...)                    → 400, якщо код невірний або прострочений
  → GeneratePasswordResetTokenAsync + ResetPasswordAsync
  → security stamp оновлюється → код стає недійсним
```

- Код не зберігається в БД. Його генерує вбудований `EmailTokenProvider` ASP.NET Identity і прив'язує до security stamp та призначення `ResetPassword`.
- Моделі: `ForgotPasswordModel`, `ResetPasswordModel` (валідація через DataAnnotations: 6 цифр, пароль мін 6 символів).
- Клієнт (`app/`) має екрани `forgot-password.tsx` і `reset-password.tsx`. Посилання «Забули пароль?» є на `login.tsx`.

---

## 5. Залежності між компонентами

```
[Expo-клієнт] ──HTTPS (axios, JSON / multipart)──▶ [nginx :443]
                                                       │ proxy
                                                       ▼
                                           [ASP.NET API :8254→8080]
                                             │              │
                                 EF Core/Npgsql│              │ файлова система
                                             ▼              ▼
                                 [PostgreSQL :5212]   [images/*.webp]
                                             ▲
                                 [db-backup: pg_dump щодня]
```

Клієнт і API з'єднані лише контрактом HTTP. Спільного коду немає.

API має ще одне вихідне з'єднання: SMTP-сервер `smtp.ukr.net`, порт 2525. Відправку виконує `EmailService` через MailKit.

Контракт описаний у `AccountController`, `RegisterModel`, `LoginModel`, моделях відновлення пароля і типах `app/src/types/`.

---

## 6. Контракт API (поточний)

| Метод | Шлях | Auth | Тіло | Відповідь |
|---|---|---|---|---|
| POST | `/api/Account/Login` | — | JSON `{ email, password }` | `200 { token }` / `401 { error }` |
| POST | `/api/Account/Register` | — | multipart: `FirstName, LastName, Email, Password, ImageFile?` | `200 { token }` / `400 { error }` або `400 { erroor }` |
| GET | `/api/Account/GetAll` | Bearer | — | `200` список `{ Id, Email, FirstName, LastName, Image, Registered }` |
| POST | `/api/Account/ForgotPassword` | — | JSON `{ email }` | `200 { message }` (однакова відповідь незалежно від наявності email) |
| POST | `/api/Account/ResetPassword` | — | JSON `{ email, code, newPassword }` | `200 { message }` / `400 { error }` |
| GET | `/images/{file}` | — | — | файл WebP |
| GET | `/api/Chats/types` | Bearer | — | `200` список `{ Id, Name }` |
| POST | `/api/Chats` | Bearer | JSON `{ Name, ChatTypeId, UserIds[] }` | `200 chatId` (автор стає адміном) |
| PUT | `/api/Chats/edit` | Bearer | JSON `{ Id, Name, AddUserIds?, RemoveUserIds? }` | `200` (лише адмін чату) |
| GET | `/api/Chats/users?Query=&ChatId=` | Bearer | — | `200` список `{ Id, Name }` |
| GET | `/api/Chats/my` | Bearer | — | `200` список `{ ChatId, Name, ChatTypeId }` |
| GET | `/api/Chats/{chatId}/messages` | Bearer | — | `200` список повідомлень (лише учасники) |
| GET | `/api/Chats/am-i-admin?chatId=` | Bearer | — | `200` bool |
| POST | `/api/Chats/invite-link` | Bearer | JSON `{ ChatId }` | `200 { link }` (`my-android://chat/invite?token=…`) |
| SignalR | `/chat` | — | виклик `Send(string)`, подія `Send(string)` | повідомлення розсилаються всім клієнтам (`ChatHub`) |
| SignalR | `/hub/chat` | — (`[Authorize]` немає) | `JoinChat(chatId)`, `SendMessage({ ChatId, Message })`, `LeaveChat(chatId)`; подія `ReceiveMessage` | повідомлення зберігаються в БД і розсилаються учасникам групи `chat-{id}` (`MyChatHub`) |

Відомі відхилення: `erroor` (помилка в назві ключа при реєстрації); `Register` використовується і для збереження профілю з `profile.tsx`; `Login` повертає 401 для невірних даних, а клієнт обробляє і 400, і 401. Клієнт поки не викликає `/api/Chats` і `/hub/chat`.

---

## 7. Ризики та технічний борг

Відсортовано за серйозністю.

| # | Ризик | Де | Наслідок | Пропозиція |
|---|---|---|---|---|
| 1 | **Секрети в `appsettings.json` у git: JWT-ключ і пароль SMTP** | `WebAPISalo/.../appsettings.json` (`Jwt:Key`, `Smtp:Password`) | Будь-хто з доступом до репо може підписувати токени і відправляти пошту з облікового запису ukr.net | Перенести в User Secrets / env, ротувати JWT-ключ і змінити пароль ukr.net |
| 2 | **`GetAll` доступний будь-якому автентифікованому користувачу** | `AccountController.GetAll` | Звичайний `User` бачить email і ПІБ усіх користувачів | Додати `[Authorize(Roles = Roles.Admin)]` |
| 3 | **Відкриті тестові облікові дані в seed** | `Program.cs` (`Admin123`, `User123`) | Вхід в адмін-акаунт, якщо seed потрапив у продакшен-БД | Прибрати seed з Production або генерувати паролі |
| 4 | **Збереження профілю через `/Register`** | `profile.tsx` | Немає оновлення профілю; запит створить нового користувача або поверне помилку | Додати `PUT /api/Account/Profile` (`[Authorize]`) |
| 5 | **Hardcoded base URL** | `src/api/config.ts` (`API_BASE_URL`, `CHAT_HUB_URL`); `profile.tsx` уже бере базу звідти | Зміна хоста вимагає правок у коді, а не в конфігурації | Винести в `app.config.ts` / `EXPO_PUBLIC_API_URL` |
| 6 | **Swagger увімкнений у продакшені** | `Program.cs` | Розкриває повний контракт API | Вмикати лише в Development |
| 7 | **CORS дозволяє будь-який origin з credentials; немає HTTPS-редіректу; `RequireHttpsMetadata = false`** | `Program.cs` | Будь-який сайт може робити запити до API і хаба від імені браузера користувача; JWT може йти по HTTP | Обмежити `WithOrigins(...)` списком доменів; `RequireHttpsMetadata = true` за TLS |
| 8 | **Токен не відкликається** | JWT 7 днів без refresh/blacklist. Після `ResetPassword` старі токени також лишаються дійсними, бо `JwtBearer` не перевіряє security stamp | Викрадений токен валідний тиждень | Коротший термін + refresh-токени; перевіряти `SecurityStamp` у `OnTokenValidated` |
| 9 | **Відсутні тести** | обидва проєкти | Регресії не ловляться | Jest + React Native Testing Library; xUnit + `WebApplicationFactory` |
| 10 | **Лінт не налаштований** | `app/` | `npm run lint` не працює коректно | Додати ESLint (`eslint-config-expo`) |
| 11 | **Нестабільний `useEffect` у кореневому layout** | `src/app/_layout.tsx` | Без масиву залежностей, виконується при кожному рендері; `initStore` викликається повторно | Додати `[]` |
| 12 | **Початковий стан `auth` завжди порожній** | `AuthSlice.ts` (`token = undefined`) | Коректне відновлення тільки через `_layout` | Прибрати мертвий код або ініціалізувати з SecureStore |
| 13 | **Помилка в ключі відповіді** | `AccountController.Register` (`erroor`) | Клієнт не бачить текст помилки | Виправити на `error` |
| 14 | **Зображення на локальному диску контейнера** | `ImageService` | Втрата при перестворенні контейнера без volume | Переконатися, що `VOLUME_SERVERAPI` змонтовано; розглянути blob-сховище |
| 15 | **Залишки шаблонів** | `WeatherForecast*`, `explore.tsx`, `components/ui`, `AndroidApp/` | Шум у проєкті, плутанина | Видалити |
| 16 | **Персональні дані в логах клієнта** | `console.log` у `profile.tsx` (`data` форми, «Update profile user»); `login.tsx` уже без логів | Персональні дані в логах | Прибрати логування даних форм |
| 17 | **Дубльовані `StyleSheet`/класи та імпорти** | `login.tsx`, `register.tsx`, `profile.tsx` | Копіпаст, важко змінювати | Винести спільні компоненти форм |
| 18 | **Немає версіонування API і обробки помилок** | API | Зміна контракту ламає клієнт без попередження | Уніфікований формат помилок (ProblemDetails) |
| 19 | ~~Зайва кома в `Smtp:UserName`~~ (виправлено) | `appsettings.json` (`"super.novakvova@ukr.net,"`) | Кому прибрано, `UserName` тепер `super.novakvova@ukr.net` | Закрито |
| 20 | **SSL-режим SMTP зашитий у коді** | `EmailService.SendAsync` (`ConnectAsync(host, port, true)`) | SSL з початку з'єднання для будь-якого порту. Для 2525 (зазвичай STARTTLS) це може не спрацювати. Поля `EnableSsl` і `FromName` у конфігу відсутні | Вибирати режим за портом або з конфігу; перевірити з ukr.net |
| 21 | **Немає обмеження спроб коду відновлення** (висока) | `AccountController.ResetPassword` | Код із 6 цифр (близько мільйона варіантів). Без ліміту спроб його можна підібрати | Лічильник невдалих спроб (`AccessFailedAsync`) або rate limiting |
| 22 | **Немає обмеження частоти `ForgotPassword`** | `AccountController.ForgotPassword` | Будь-хто може надсилати листи на довільні адреси (спам, навантаження на SMTP) | `AddRateLimiter` по IP і по email |
| 23 | **Помилка SMTP ковтається** | `ForgotPassword` (`catch` з логом) | Клієнт отримує 200, навіть якщо лист не відправлено. Видно лише в логах | Черга відправки з повтором або моніторинг логів |
| 24 | **Ім'я відправника захардкоджене** | `EmailService.SendAsync` (`"Група p34"`) | Не береться з конфігу | Перенести в `Smtp:FromName` |
| 25 | **Шлях до шаблону залежить від робочої папки** | `EmailService.SendPasswordResetCodeAsync` (`Directory.GetCurrentDirectory()`) | Запуск з іншої папки дасть `FileNotFoundException` | Використовувати `IWebHostEnvironment.ContentRootPath` |
| 26 | **Чат `/chat` без автентифікації і без збереження** | `ChatHub.Send` | Будь-хто може писати в чат і читати його. Повідомлення не зберігаються, без відправника | Прибрати `/chat` після переходу клієнта на `/hub/chat` |
| 27 | **`/hub/chat` без надійної автентифікації** | `MyChatHub`, `IdentityService` | Немає `[Authorize]`. `IdentityService` бере email з `HttpContext.User`, а в хабі той може бути недоступний (потребує перевірки). JWT для WebSocket не передається (немає `OnMessageReceived` з токеном із query) | `[Authorize]` на хабі, JWT через query для SignalR, ідентифікація через `Context.User` |
| 28 | **Секрет invite-токенів зашитий у коді** | `Services/InviteTokenService.cs` (`Secret = "SUPER_SECRET_KEY_CHANGE_ME"`) | Будь-хто з доступом до репо може підробити invite-токен. Сервіс без інтерфейсу, не в DI, без терміну дії. `Validate` ще ніде не використовується | Секрет у конфіг/env, `IInviteTokenService` з DI, термін дії в токені |
| 29 | **Список усіх користувачів без обмежень** | `ChatsController.GetUsers` → `ChatService.GetAllUsersAsync` | Будь-який автентифікований користувач бачить `Id` і ПІБ усіх користувачів (порожній пошук повертає всіх) | Мінімальна довжина запиту, ліміт результатів, пошук лише по контактах |
| 30 | **Invite-посилання зі схемою `my-android://`** | `ChatsController.GenerateInvite` | Схема (назва з Android-шаблону) не перевірена на відповідність клієнту `app/`; прийом запрошення ще не реалізовано (`join.tsx` порожній) | Узгодити схему з клієнтом, реалізувати прийом у `app/` |

---

## 8. Команди (довідник)

Повний список — у `CLAUDE.md`.

```bash
# Клієнт (app/)
npx expo start
npx tsc --noEmit
npx expo install <pkg>

# Бекенд (корінь)
dotnet build WebAPISalo/WebAPISalo/WebAPISalo.csproj
dotnet run --project WebAPISalo/WebAPISalo
dotnet ef migrations add <Name> --project WebAPISalo/WebAPISalo

# Публікація API
build_and_push.bat
```

---

## 9. Відкриті питання

1. Чи планується оновлення профілю (ім'я, фото), і який endpoint для цього використовувати?
2. Чи потрібна роль `Admin` в інтерфейсі, чи лише `GetAll` на бекенді?
3. Цільові платформи: лише iOS/Android, чи також веб (`web.output: "server"` вказує на SSR-експеримент)?
4. Де має жити сховище зображень у продакшені: локальний volume чи зовнішнє (S3/Blob)?
5. Чи є план прибрати `AndroidApp/` з репозиторію?
6. Який SSL/STARTTLS-режим використовувати для порту 2525 на ukr.net і чи звідси братиме адресу відправника `Smtp:UserName`, чи окремий `FromEmail`?
7. Чи потрібні ліміти спроб для коду відновлення та для `ForgotPassword` (ризики #21, #22)?
8. Коли клієнт переходить з `/chat` (`ChatHub`) на `/hub/chat` (`MyChatHub`) і чи прибирати `ChatHub`?
9. Чи потрібен прийом invite-посилань (`join.tsx`) і яка схема URL для них (ризик #30)?
