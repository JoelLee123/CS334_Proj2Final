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
* The background image for the NotesPage:
- https://loading.io/background/m-swell-waves/

* The loading GIF:
- https://loading.io/spinner/spinner/

* The video on startup pages
- https://pixabay.com

#******************************************************************************************

.body-modal-open {
  overflow: hidden;
}

.body-modal-open .modal-overlay {
  pointer-events: none;
}

Frontend modal css assited by github copilot

Other references for modal styling:
http://reactcommunity.org/react-modal/styles/
From React community

Learning react hooks and components from:
https://react.dev/learn


Mapping notes to be rendered, idea from a react tutorial:
https://react.dev/learn/rendering-lists

notesDisplayed.map((note, index) => (
  
)

#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************
#******************************************************************************************

