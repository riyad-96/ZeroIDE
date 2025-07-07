function Migrate() {
  const versions = ['v1.0.0', 'v1.0.1'];

  const appliedVersion = JSON.parse(localStorage.getItem('versions'));

  //! Apply migration helper
  function applyMigration(version, callback) {
    const isMigrated = appliedVersion.includes(version);
    if (!isMigrated) {
      callback();

      appliedVersion.push(version);
      localStorage.setItem('versions', JSON.stringify(appliedVersion));
    }
  }

  function patch_v1_0_1() {
    // zero-btn cdn link added in the starter tag
    // Jul 8 25;

    const patch = 'v1.0.1';
    applyMigration(patch, () => {
      const allSavedCode = JSON.parse(localStorage.getItem('allSavedCode')) || [];
      allSavedCode.forEach((obj) => {
        obj.code.headTags = [];
      });
      localStorage.setItem('allSavedCode', JSON.stringify(allSavedCode));
    });
  }

  function migrate() {
    patch_v1_0_1();
  }

  if (!appliedVersion) {
    localStorage.setItem('versions', JSON.stringify(versions));
    const oldVersionRecord = localStorage.getItem('version');
    if (oldVersionRecord) {
      localStorage.removeItem('version');
    }
    return;
  }
  migrate();
}

export default Migrate;
