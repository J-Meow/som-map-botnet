Deno.serve({ port: 5218 }, (req) => {
  console.log(req.url);
  return new Response("asdf");
});
