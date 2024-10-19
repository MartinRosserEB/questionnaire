import type { Handle } from "@sveltejs/kit";
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/core/providers/auth0';
import EmailProvider from '@auth/core/providers/email';
import { sequence } from "@sveltejs/kit/hooks";
import { error } from '@sveltejs/kit';
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Prisma } from "@prisma/client"
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, AUTH0_SECRET, AUTH0_CID, AUTH0_CSECRET } from '$env/static/private';
import prisma from "$lib/prisma";
import { sendLoginEmail } from "$lib/email";

const config: SvelteKitAuthConfig = {
  trustHost: true,
  providers: [
    EmailProvider({
      maxAge: 60 * 60 * 24,
      server: {
       host: SMTP_HOST,
       port: Number(SMTP_PORT),
       auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
       }
      },
      from: SMTP_FROM,
      sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from }
      }) {
        sendLoginEmail({identifier: email, url: url, provider: { server, from }});
      }
     }),
    Auth0Provider({
      id: 'auth0',
      name: 'Auth0',
      clientId: AUTH0_CID,
      clientSecret: AUTH0_CSECRET,
      issuer: 'https://dev-7kqqwd6gqjmgn36z.eu.auth0.com/',
      wellKnown: 'https://dev-7kqqwd6gqjmgn36z.eu.auth0.com/.well-known/openid-configuration'
    })
  ],
  adapter: PrismaAdapter(prisma),
  secret: AUTH0_SECRET,
  debug: import.meta.env.MODE !== "production",
  session: {
    maxAge: 1800, // 30 mins
    strategy: 'jwt'
  },
  callbacks: { // add roles to user
    async session({ token, session }) {
      if (token && session?.user) {
        session.user.roles = token.roles;
      }

      return session;
    },
    async jwt({ token }) {
      const dbUser = await prisma.user.findUnique({
        select: {
          roles: {
            select: {
              name: true
            }
          }
        },
        where: {
          email: token.email!,
        },
      });

      token.roles = dbUser?.roles;

      return token;
    },
  }
};

const authHandle = SvelteKitAuth(config) satisfies Handle;

const denyHandle = (async ({ event, resolve }) => {
	// Protect api (only available if logged in)
	if (event.url.pathname.startsWith('/api') && !event.url.pathname.startsWith('/api/public')) {
   const session = await event.locals.getSession();
		if (!session) {
			throw error(401, 'unauthorized');
		}
	}

	// If the request is still here, just proceed as normally
	return resolve(event);
}) satisfies Handle;

export const handle = sequence(authHandle, denyHandle);