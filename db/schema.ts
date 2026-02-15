import { pgTable, serial, varchar, text, timestamp, boolean, integer, real, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['julissa', 'natalia']);
export const orderTypeEnum = pgEnum('order_type', ['cake', 'pasapalos']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'in_progress', 'ready', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'partial']);

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: varchar('image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  role: userRoleEnum('role').notNull().default('julissa'),
});

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  expiresAt: timestamp('expires_at'),
  token: varchar('token', { length: 255 }).unique(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  ipAddress: varchar('ip_address', { length: 255 }),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('accounts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }),
  providerId: varchar('provider_id', { length: 255 }),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: varchar('scope', { length: 500 }),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const verifications = pgTable('verifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }),
  value: varchar('value', { length: 255 }),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  type: orderTypeEnum('type').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  time: varchar('time', { length: 10 }).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  totalAmount: real('total_amount').notNull().default(0),
  needsTopper: boolean('needs_topper').notNull().default(false),
  delegatedToNatalia: boolean('delegated_to_natalia').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const toppers = pgTable('toppers', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull().unique(),
  description: text('description').notNull(),
  occasion: varchar('occasion', { length: 255 }),
  price: real('price').notNull().default(0),
  isReady: boolean('is_ready').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const topperImages = pgTable('topper_images', {
  id: serial('id').primaryKey(),
  topperId: integer('topper_id').references(() => toppers.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  amount: real('amount').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Topper = typeof toppers.$inferSelect;
export type TopperImage = typeof topperImages.$inferSelect;
export type Payment = typeof payments.$inferSelect;
