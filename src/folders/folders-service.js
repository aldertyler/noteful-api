const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("folders");
  },

  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("folders")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  getById(knex, folderid) {
    return knex.from("folders").select("*").where("folderid", folderid).first();
  },

  deleteFolder(knex, folderid) {
    return knex("folders").where({ folderid }).delete();
  },

  updateFolder(knex, folderid, newFoldersFields) {
    return knex("folders").where({ folderid }).update(newFoldersFields);
  },
};

module.exports = FoldersService;
