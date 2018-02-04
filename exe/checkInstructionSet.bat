@ECHO OFF
SET CW=%CD%
%CW%\instructionset-checker.exe | findstr "^SSE ^AVX"