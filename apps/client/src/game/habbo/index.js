



class MemberBuilder {
  script() {}

  bitmap() {}
}

function createMember(name) {
  return new MemberBuilder();
}

export default createMovie("habbo")
  .casts(
    createCast("Internal")
      .members(
        createMember("Initialization").script(),
        createMember("Logo")
          .bitmap(Internal_4_Logo)
          .registrationPoint(29, 23)
          .build(),
      )
      .build(),
    createCast("fuse_client").from(fuseClient),
  )
  .build();
