## getNthFileNameInFolder()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17397-17438

### Usage
```lingo

```

### Description
Movie method; returns a filename from the directory folder based on the specified path and
number within the folder. To be found by the getNthFileNameInFolder function, Director
movies must be set to visible in the folder structure. (On the Macintosh, other types of files are
found whether they are visible or invisible.) If this function returns an empty string, you have
specified a number greater than the number of files in the folder.
The getNthFileNameInFolder function doesn’t work with URLs.
To specify other folder names, use the @ pathname operator or the full path defined in the format
for the specific platform on which the movie is running. For example:

• In Windows, use a directory path such as C:/Director/Movies.
• On the Macintosh, use a pathname such as HardDisk:Director:Movies. To look for files on the
Macintosh desktop, use the path HardDisk:Desktop Folder

• This function is not available in Shockwave Player.

### Parameters
folderPath Required. Specifies the path to the folder that contains the file.
fileNumber Required. Specifies the index position of the file in the folder.

### Example
```lingo
The following handler returns a list of filenames in the folder on the current path. To call the
function, use parentheses, as in put currentFolder().
on currentFolder
fileList = [ ]
repeat with i = 1 to 100
n = getNthFileNameInFolder(the moviePath, i)
if n = EMPTY then exit repeat
fileList.append(n)
end repeat
return fileList
end currentFolder
```

### See also
@ (pathname), Movie

getNthFileNameInFolder()

337

### Implementation
- **File**: `apps/client/src/director/api/getNthFileNameInFolder.js`
- **Test**: `apps/client/src/director/api/__tests__/getNthFileNameInFolder.test.js`
- **Dependencies**: Various (depends on function)

