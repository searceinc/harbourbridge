const renderInstructionsHtml = (params) => {
    return (
        `<body>
            <header class="main-header" onLoad="CallbackFunction();">
                <nav class="navbar navbar-static-top">
                  <img src="Icons/Icons/google-spanner-logo.png" class="logo">
                </nav>
              
                <nav class="navbar navbar-static-top">
                  <div class="header-topic" style="margin-right: 30px;"><a href='/frontend/' style="text-decoration: none; color: #5E5752;">Home</a></div>
                </nav>
              
                <nav class="navbar navbar-static-top">
                  <div class="header-topic" style="margin-right: 30px;"><a href="" style="text-decoration: none; color: #5E5752;">Schema Conversion</a>
                  </div>
                </nav>
              
                <nav class="navbar navbar-static-top">
                  <div class="header-topic"><a href="instructions" style="text-decoration: none; color: #4285f4;">Instructions</a></div>
                </nav>
              
              </header>

              <div class='spinner-backdrop' id='toggle-spinner' style="display:none">
                <div id="spinner"></div>
              </div>

              <div class='instructions-main-content'>
                <div class='mdc-card inst-mdc-card-content table-card-border'> 
                  <div class='mdc-card ddl-content'>
                    <pre>
                      <code>
                        ---------------------------------------------------------------------------------
                        HarbourBridge: Turnkey Spanner Evaluation
                        ---------------------------------------------------------------------------------
                        <br>
                        HarbourBridge is a stand-alone open source tool for Cloud Spanner evaluation,
                        using data from an existing PostgreSQL or MySQL database. The tool ingests schema
                        and data from either a pg_dump/mysqldump file or directly from the source database,
                        automatically builds a Spanner schema, and creates a new Spanner database populated
                        with data from the source database.
                        <br>
                        To use the tool on a PostgreSQL database called mydb, run

                       
                        # By default, the driver is "pg_dump".
                        pg_dump mydb | harbourbridge
                        # Or,
                        pg_dump mydb | harbourbridge -driver=pg_dump
                        

                        To use the tool on a MySQL database called mydb, run

                       
                        mysqldump mydb | harbourbridge -driver=mysqldump
                       

                        HarbourBridge accepts pg_dump/mysqldump's standard plain-text format, but not archive or
                        custom formats.

                        **WARNING: Please check that permissions for the Spanner instance used by
                        HarbourBridge are appropriate. Spanner manages access control at the database
                        level, and the database created by HarbourBridge will inherit default
                        permissions from the instance. All data written by HarbourBridge is visible to
                        anyone who can access the created database.**
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
        </body>
        `
    )
}