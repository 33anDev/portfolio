# uzeirovic.se

Min personliga portfolio. Sidan visar vem jag är, vad jag pluggar och mina projekt som **klickbara live-demos**: Procyon (processmonitor i Rust), Nordvik Bank och Svea Roleplay (FiveM). Den har ljust och mörkt tema, svenska och engelska, en animerad memoji, snabbfrågor om mig och en gästbok med Google-inloggning.

**Byggd med:** HTML, CSS och JavaScript utan ramverk. Gästboken använder [Supabase](https://supabase.com) för databas och inloggning. Sidan ligger på [Vercel](https://vercel.com).

```
index.html          sidans innehåll
css/style.css       design, tema och animationer
css/demos.css       utseendet på projekt-demona
js/core.js          språk, tema, effekter, snabbfrågor, memoji
js/procyon.js       demo: Procyon
js/nordvik.js       demo: Nordvik Bank och bankomat
js/svea.js          demo: Svea pausmeny, HUD, faktura och admin
js/guestbook.js     gästboken (Supabase + Google)
config.js           inställningar för gästboken
supabase/schema.sql databasen och säkerhetsreglerna
img/                bilder
```

---

# Guide: få upp sidan med Google-inloggning

Allt är gratis. Räkna med ungefär 30 minuter första gången. Gör stegen i ordning.

## Steg 1. Supabase (databas och inloggning)

1. Gå till **supabase.com**, logga in med GitHub och tryck **New project**.
2. Namn: `portfolio`. Hitta på ett databaslösenord och spara det någonstans. Region: välj en i Europa, gärna **Stockholm** om den finns, annars **Frankfurt**. Tryck **Create**.
3. När projektet är klart: öppna **SQL Editor** i vänstermenyn och tryck **New query**.
4. Öppna filen `supabase/schema.sql` här i repot, kopiera allt, klistra in och tryck **Run**. Det ska stå *Success*.

## Steg 2. Lägg in nycklarna i config.js

1. I Supabase: gå till **Project Settings → API** (kan heta *Data API* / *API Keys*).
2. Kopiera **Project URL** och nyckeln **anon public**.
3. Här på GitHub: öppna `config.js`, tryck på pennan (**Edit**) och klistra in dem:
   ```js
   SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJhbGciOi...',
   ```
4. Tryck **Commit changes**.

> Det är säkert att de här två ligger öppet. Supabase är byggt så, och säkerhetsreglerna i `schema.sql` bestämmer vad besökare får göra. Lägg **aldrig** in nyckeln som heter *service_role* här.

## Steg 3. Google-inloggning

**I Supabase**
1. Gå till **Authentication → Sign In / Providers → Google**.
2. Kopiera adressen under **Callback URL (for OAuth)**. Den ser ut som `https://xxxxxxxx.supabase.co/auth/v1/callback`. Låt fliken vara öppen.

**I Google Cloud**
1. Gå till **console.cloud.google.com** och logga in med ditt Google-konto.
2. Skapa ett nytt projekt uppe till vänster, t.ex. `uzeirovic-se`.
3. Sök på **Google Auth Platform** (eller *OAuth consent screen*) och tryck **Get started**.
   * App name: `uzeirovic.se`
   * Support email: din mejl
   * Audience: **External**
   * Contact information: din mejl, godkänn och tryck **Create**.
4. Gå till **Clients → Create client**.
   * Application type: **Web application**
   * Name: `Portfolio`
   * Under **Authorized redirect URIs** tryck **Add URI** och klistra in Callback URL från Supabase.
   * Tryck **Create**.
5. Kopiera **Client ID** och **Client secret**.
6. Gå till **Audience** och tryck **Publish app** så att alla kan logga in, inte bara du. Sidan frågar bara efter namn, mejl och profilbild, så ingen granskning från Google behövs.

**Tillbaka i Supabase**
1. Slå på **Google**, klistra in Client ID och Client secret och tryck **Save**.

## Steg 4. Publicera på Vercel

1. Gå till **vercel.com** och logga in med GitHub.
2. Tryck **Add New → Project**, välj repot `portfolio` och tryck **Import**.
3. Framework Preset: **Other**. Ändra inget annat och tryck **Deploy**.
4. Efter en minut får du en adress, t.ex. `https://portfolio-33andev.vercel.app`. Kopiera den.

Varje gång något ändras i repot uppdateras sidan automatiskt.

## Steg 5. Berätta för Supabase var sidan ligger

1. I Supabase: **Authentication → URL Configuration**.
2. **Site URL:** din Vercel-adress, t.ex. `https://portfolio-33andev.vercel.app`
3. Under **Redirect URLs**, lägg till:
   ```
   https://portfolio-33andev.vercel.app/**
   https://uzeirovic.se/**
   https://www.uzeirovic.se/**
   ```
4. Tryck **Save**.

Klart! Öppna sidan, scrolla till gästboken och tryck **Logga in med Google**. 🎉

---

## När du köper uzeirovic.se

1. Köp domänen hos t.ex. Loopia, one.com eller Cloudflare.
2. I Vercel: **Project → Settings → Domains**, skriv `uzeirovic.se` och tryck **Add**. Lägg även till `www.uzeirovic.se`.
3. Vercel visar exakt vilka DNS-poster du ska lägga in hos domänsäljaren. Kopiera dem dit. Det kan ta från några minuter upp till ett dygn innan det slår igenom.
4. I Supabase → **Authentication → URL Configuration**: ändra **Site URL** till `https://uzeirovic.se`.

Förhandsbilden när någon delar länken (`og.png`) fungerar fullt ut först när domänen är kopplad.

## Moderera gästboken

Logga in med **uzeirovicemil44@gmail.com** på sidan. Då ser du **Ta bort** på alla omdömen. Andra besökare kan bara ändra och ta bort sina egna. Vill du använda en annan mejl som ägare: ändra den både i `config.js` och sista raden i `supabase/schema.sql`, och kör SQL-filen igen.

## Testa lokalt

Öppna mappen i VS Code och kör sidan med tillägget *Live Server*, eller i terminalen:

```
npx serve .
```

Lägg då till `http://localhost:3000/**` under Redirect URLs i Supabase om du vill testa inloggningen lokalt.
