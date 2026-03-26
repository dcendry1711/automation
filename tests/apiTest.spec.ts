import { test, expect } from "./fixtures/api.fixture";
import { checkResponseStatus } from "./helpers/checkResponseStatus.helper";
import { Post, User } from "./apiTypes";

test.describe("Debugging and CI/CD tests", () => {
  test("Debbuging get request", async ({ jpContext }) => {
    await test.step("send get request to API to get first post data", async () => {
      const postId = 1;
      const response = await jpContext.get(`/posts/${postId}`);

      console.log(`Response status: ${response.status()}`); //podanie do konsoli response status
      console.log(`Response text: ${await response.text()}`); //podanie do konsoli response text

      const postData: Post = await response.json(); //przeróbka surowego response text na json'a

      await test.step("check response status", async () => {
        checkResponseStatus(response, 200); //helper sprawdzający response status
        expect(postData.id === postId).toBe(true); //asercja na sprawdzenie czy id obiektu otrzymanego z get requesta jest poprawne
      });
    });
  });

  test("Timeout, retries and response time", async ({ jpContext }) => {
    //retries zostało skonfigurowane na "2", a timeout na "10000" w playwright.config.ts
    await test.step("send get request to API to get second post data", async () => {
      const postId = 2;
      const start = Date.now(); //start pomiaru czasu wykonania response
      const response = await jpContext.get(`/posts/${postId}`, {
        timeout: 3000, //timeout ustawiony na 3000 ms
      });
      const end = Date.now(); //koniec pomiaru czasu wykonania response
      const responseTime = end - start; //łączny czas wykonania dla response
      console.log(`Response time: ${responseTime} ms`); //logowanie czasu response do konsoli

      const postData: Post = await response.json(); //parsowanie obiektu z responsa do jsona

      await test.step("check response status, time and data", async () => {
        checkResponseStatus(response, 200); //helper sprawdzający response status
        expect(postData.id === postId).toBe(true); //sprawdzenie id obiektu otrzymanego z id w wysyłanym requeście
        expect(responseTime).toBeLessThan(1000); //sprawdzenie czy czas response jest mniejszy niż 1000 ms
      });
    });
  });

  test("POST and response debugging", async ({ djContext }) => {
    const newUser: Partial<User> = {
      //dane dla nowego użytkownika z Partialem bo podaję tylko część danych dla typu User
      firstName: "Daniel",
      lastName: "Tester",
      age: 30,
    };

    await test.step("send post request to API with newUser data", async () => {
      const response = await djContext.post("/users/add", { data: newUser }); //wysyłka do API
      console.log(`Response status: ${response.status()}`); //logowanie response status
      console.log(`Response text: ${await response.text()}`); //logowanie response text

      const userData: User = await response.json(); //parsowanie obiektu do jsona

      await test.step("check response status and data", async () => {
        checkResponseStatus(response, 201); //helper sprawdzający status
        expect(userData).toHaveProperty("id"); //asercja na sprawdzenie czy obiekt ma propertę "id"
        //sprawdzenie obiektu pod kątem danych, czy są zgodne z postem i czy został nadany numer id
        expect(userData).toMatchObject({
          id: expect.any(Number),
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          age: newUser.age,
        });
      });
    });
  });

  test("Get data and generate raport", async ({ djContext }) => {
    await test.step("send get request to get all users from API", async () => {
      const response = await djContext.get("/users");
      const usersData = await response.json();
      const usersArr: User[] = usersData.users;
      const usersCount = usersArr.length;

      console.log(`Response status: ${response.status()}`);
      console.log(`Total users in DB: ${usersCount}`);

      await test.step("check response status and data", async () => {
        checkResponseStatus(response, 200);
        expect(usersArr).toBeInstanceOf(Array);
        expect(usersArr.length).toBeGreaterThan(0);
        usersArr.forEach((user) => {
          expect(user).toHaveProperty("id");
          expect(user).toMatchObject({
            id: expect.any(Number),
            firstName: expect.any(String),
            lastName: expect.any(String),
            age: expect.any(Number),
          });
        });
      });
    });
  });
});

//jakaś zmiana