#******************************************************************************************
* The code below comes from this guide on how to connect Prisma to Supabase:
https://supabase.com/partners/integrations/prisma

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  directUrl         = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
* I modified the above code to model our database to what it is in schema.prisma.
#******************************************************************************************


#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************

