cd ./api
call npm install
start /b call npm run dev
cd ../web
call npm install
start /b call npm run dev
ping 127.0.0.1 -n 2 > nul
echo[
echo Connect to localhost link above to start codelink. 
echo Close terminal when finished with codelink.