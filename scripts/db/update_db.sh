# get file
FILE="./.env"
VALUES=''
TEMP_FILE="temp.txt"
FIELDS_FILE="./scripts/db/env.fields";
FIELDS=""
# create filtered temp file
# removing emoty lines and comments
sed -e '/^#/d' -e '/^$/d' "$FILE" > $TEMP_FILE

# read the file line by line
 while read -r line; do
    # everything before "=" for the name
    # everything after "=" for the value
    VALUES="$VALUES ('${line%%=*}', '${line#*=}'),"
    FIELDS="$FIELDS${line%%=*}\n"
done < $TEMP_FILE
# adding brackets for a proper syntax and removing possible commas at eol
VALUES="${VALUES%,}"
# building statement
STATEMENT="INSERT INTO configs (name, value ) VALUES $VALUES"
# log into mysql
mysql -u $db_username  -p $database -h $db_host -P $db_port  << EOF
$STATEMENT
EOF

rm $TEMP_FILE
echo $FIELDS > $FIELDS_FILE
echo "done!"
