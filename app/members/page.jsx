1233
1234
1235
1236
1237
1238
1239
1240
1241
1242
1243
1244
1245
1246
1247
1248
1249
1250
1251
1252
1253
1254
1255
1256
1257
1258
1259
1260
1261
1262
1263
1264
1265
1266
1267
1268
1269
1270
1271
1272
1273
1274
1275
1276
1277
1278
1279
1280
1281
1282
1283
1284
1285
1286
1287
1288
1289
1290
1291
1292
1293
1294
1295
1296
1297
1298
1299
1300
1301
1302
1303
1304
1305
1306
1307
1308
1309
1310
1311
1312
1313
1314
1315
1316
1317
1318
1319
1320
1321
1322
1323
1324
1325
1326
1327
1328
1329
1330
1331
1332
1333
1334
1335
1336
1337
1338
1339
1340
1341
"use client";
    alignItems: "center",
    gap: "11px",
    padding: "10px",
    marginBottom: "18px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "50%",
    background: "#F4C20D",
    color: "#050505",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
    fontSize: "12px",
  },

  memberName: {
    color: "#FFFFFF",
    display: "block",
    fontSize: "13px",
  },

  memberStatus: {
    color: "#F4C20D",
    display: "block",
    fontSize: "8px",
    fontWeight: "900",
    marginTop: "3px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navButton: {
    position: "relative",
    width: "100%",
    background: "transparent",
    color: "#999999",
    border: "none",
    borderRadius: "8px",
    padding:
      "13px 13px 13px 18px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "12px",
  },

  navButtonActive: {
    background: "#151515",
    color: "#FFFFFF",
  },

  navIndicator: {
    position: "absolute",
    left: "6px",
    top: "50%",
    transform:
      "translateY(-50%)",
    width: "3px",
    height: "18px",
    borderRadius: "5px",
    background: "transparent",
  },

  navIndicatorActive: {
    background: "#F4C20D",
  },

  sidebarBottom: {
    marginTop: "auto",
    borderTop:
      "1px solid #2A2A2A",
    padding:
      "18px 8px 0",
  },

  sidebarText: {
    color: "#777777",
    fontSize: "11px",
  },

  sidebarBookButton: {
    display: "block",
    textAlign: "center",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "8px",
    padding: "11px",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "10px",
  },

  content: {
    flex: 1,
    minWidth: 0,
    padding:
      "clamp(22px, 4vw, 48px)",
    overflow: "hidden",
  },
};
