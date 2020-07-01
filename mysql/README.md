## Example Usage

The following examples assume `harbourbridge` has been added to your PATH
environment variable.

To use HarbourBridge on a MySQL database called mydb using mysqldump, run:

```sh
mysqldump mydb | harbourbridge -driver=mysqldump
```

The tool can also be applied to an existing mysqldump file:

```sh
harbourbridge -driver=mysqldump < mysqldump
```

To specify a particular Spanner instance to use, run:

```sh
mysqldump mydb | harbourbridge -instance my-spanner-instance -driver=mysqldump
```

By default, HarbourBridge will generate a new Spanner database name to populate.
You can override this and specify the database name to use by:

```sh
mysqldump mydb | harbourbridge -dbname my-spanner-database-name -driver=mysqldump
```

HarbourBridge generates a report file, a schema file, and a bad-data file (if
there are bad-data rows). You can control where these files are written by
specifying a file prefix. For example,

```sh
mysqldump mydb | harbourbridge -prefix mydb. -driver=mysqldump
```

will write files `mydb.report.txt`, `mydb.schema.txt`, and
`mydb.dropped.txt`. The prefix can also be a directory. For example,

```sh
mysqldump mydb | harbourbridge -prefix ~/spanner-eval-mydb/ -driver=mysqldump
```

would write the files into the directory `~/spanner-eval-mydb/`. Note
that HarbourBridge will not create directories as it writes these files.

To use the tool directly on a MySQL database called mydb, run

```sh
harbourbridge -driver=mysql
```

It is assumed that MySQL database supports information schema tables and _MYSQLHOST_, _MYSQLPORT_, _MYSQLUSER_, _MYSQLDATABASE_ environments variables are set. Password can be specified either in the _MYSQL_PWD_ environment variable or need to enter password when prompted by harbourbridge.

Rest of the above mentioned usage of options also apply to Information schema approach.

## Schema Conversion

The HarbourBridge tool maps MySQL types to Spanner types as follows:

| MySQL Type                    | Spanner Type      | Notes                           |
| ----------------------------- | ----------------- | ------------------------------- |
| `BOOL`,`BOOLEAN`,`TINYINT(1)` | `BOOL`            |                                 |
| `BIGINT`                      | `INT64`           |                                 |
| `BINARY`                      | `BYTES(MAX)`      |                                 |
| `BLOB`                        | `BYTES(MAX)`      |                                 |
| `BIT`                         | `BYTES(MAX)`      |                                 |
| `CHAR(N)`                     | `STRING(N)`       | c                               |
| `DATE`                        | `DATE`            |                                 |
| `DATETIME`                    | `TIMESTAMP`       |                                 |
| `DOUBLE`                      | `FLOAT64`         |                                 |
| `ENUM`                        | `STRING(MAX)`     |                                 |
| `FLOAT`                       | `FLOAT64`         | s                               |
| `INTEGER`                     | `INT64`           | s                               |
| `JSON`                        | `STRING(MAX)`     |                                 |
| `LONGBLOB`                    | `BYTES(MAX)`      |                                 |
| `MEDIUMBLOB`                  | `BYTES(MAX)`      |                                 |
| `MEDIUMINT`                   | `INT64`           | s                               |
| `MEDIUMTEXT`                  | `STRING(MAX)`     |                                 |
| `REAL`                        | `FLOAT64`         | s                               |
| `SERIAL`                      | `INT64`           | a, s                            |
| `SET`                         | `ARRAY(`string`)` | Set only supports string values |
| `SMALLINT`                    | `INT64`           | s                               |
| `TEXT`                        | `STRING(MAX)`     |                                 |
| `TIMESTAMP`                   | `TIMESTAMP`       |                                 |
| `TINYBLOB`                    | `BYTES(MAX)`      |                                 |
| `TINYINT`                     | `INT64`           | s                               |
| `TINYTEXT`                    | `STRING(MAX)`     |                                 |
| `VARBINARY`                   | `BYTES(MAX)`      |                                 |
| `VARCHAR`                     | `STRING(MAX)`     |                                 |
| `VARCHAR(N)`                  | `STRING(N)`       | c                               |

Spanner do not have support for Spatial datatypes of MySQL. Along with spatial datatypes
all other types map to `STRING(MAX)`. Some of the mappings in this table
represent loss of precision (marked p), dropped autoincrement functionality
(marked a), differences in treatment of timezones (marked t), differences in
treatment of fixed-length character types (marked c), and changes in storage
size (marked s). We discuss these, as well as other limits and notes on
schema conversion, in the following sections.

### `TIMESTAMP`

MySQL has two timestamp types: `TIMESTAMP` and `DATETIME`. Both have an 8
byte data representation and provide microsecond resolultion, but neither
actually stores a timezone with the data. The keys difference between the two
types is how string literals are converted to timestamps and queries return
data. For `TIMESTAMP`, all timezone information is dropped, and data is returned
without a timezone. For `DATETIME`, string literals are converted to UTC,
using the literal's timezone if it is specified, or the MySQL's timezone
paramater if not. When data is printed stored data (in UTC) is converted to the
timezone from the timezone parameter

Spanner has a single timestamp type. Data is stored as UTC (there is no separate
timezone) Spanner client libraries convert timestamps to UTC before sending them
to Spanner. Data is always returned as UTC. Spanner's timestamp type is
essentially the same as `DATETIME`, except that there is no analog of
MySQL's timezone parameter.

In other words, mapping MySQL `DATETIME` to `TIMESTAMP` is fairly
straightforward, but care should be taken with MySQL `TIMESTAMP` data
because Spanner clients will not drop the timezone.

### Storage Use

The tool maps several MySQL types to Spanner types that use more storage.
For example, `SMALLINT` is a two-byte integer, but it maps to Spanner's `INT64`,
an eight-byte integer. This additional storage could be significant for large
arrays.

### Primary Keys

Spanner requires primary keys for all tables. MySQL recommends the use of
primary keys for all tables, but does not enforce this. When converting a table
without a primary key, HarbourBridge will create a new primary key of type
INT64. By default, the name of the new column is `synth_id`. If there is already
a column with that name, then a variation is used to avoid collisions.

### NOT NULL Constraints

The tool preserves `NOT NULL` constraints. Note that Spanner does not require
primary key columns to be `NOT NULL`. However, in MySQL, a primary key is a
combination of `NOT NULL` and `UNIQUE`, and so primary key columns from
MySQL will be mapped to Spanner columns that are both primary keys and `NOT NULL`.

### Foreign Keys and Default Values

Spanner does not currently support foreign keys or default values. We drop these
MySQL features during conversion.

### Other MySQL features

MySQL has many other features we haven't discussed, including functions,
sequences, procecdures, triggers, (non-primary) indexes and views. The tool does
not support these and the relevant statements are dropped during schema
conversion.

See
[Migrating from MySQL to Cloud Spanner](https://cloud.google.com/solutions/migrating-mysql-to-spanner)
for a general discussion of MySQL to Spanner migration issues.
HarbourBridge follows most of the recommendations in that guide. The main
difference is that we map a few more types to `STRING(MAX)`.

## Data Conversion

### Timestamps and Timezones

As noted earlier when discussing [schema conversion of
TIMESTAMP](#timestamp), there are some sutble differences in how timestamps are
handled in MySQL and Spanner.

During data conversion, MySQL `DATETIME` values are converted to UTC and
stored in Spanner. The conversion proceeds as follows. If the value has a
timezone, that timezone is respected during the conversion to UTC. If the value
does not have a timezone, then we look for any `set timezone` statements in the
mysqldump output and use the timezone specified. Otherwise, we use the `TZ`
environment variable as the timezone, and failing that, we use the local system
timezone default (as determined by Go).

### Strings, character set support and UTF-8

Spanner requires that `STRING` values be UTF-8 encoded. All Spanner functions
and operators that act on `STRING` values operate on Unicode characters rather
than bytes. Since we map many MySQL types (including `TEXT` and `CHAR`
types) to Spanner's `STRING` type, HarbourBridge is effectively a UTF-8 based
tool.

Note that the tool itself does not do any encoding/decoding or UTF-8 checks: it
passes through data from mysqldump to Spanner. Internally, we use Go's string
type, which supports UTF-8.
