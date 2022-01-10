const { showError, showSuccess } = require("./postResponses");
const formidable = require("formidable");
const querystring = require("querystring");
const sharp = require("sharp");
const ExcelJS = require("exceljs");
const { promisify } = require("util");
const json = require("../../examples/report/data");
const { randomInt } = require("../helpers.js");

async function handlePostRequests(req, res, parsedUrl) {
  let urlPath = parsedUrl.pathname;

  // console.log("urlPath", urlPath);
  let rootPath = `${req.headers["x-forwarded-proto"]}://${req.headers["x-forwarded-host"]}`;
  // console.log(req.headers);

  urlPath = urlPath.toLowerCase();

  // console.log("handlePostRequests", urlPath);
  try {
    switch (true) {
      case urlPath.startsWith("/generate_report"): {
        let data = "";
        for await (let chunk of req) data += chunk;
        data = JSON.parse(data.toString());
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Test sheet");
        worksheet.mergeCells("A1:A2");
        worksheet.mergeCells("B1:U1");

        const matrixSheet = [
          { col: "B2", key: "Всего количество абитуриентов" },
          { col: "C2", key: "Граждане ДНР" },
          { col: "D2", key: "Гумпрограмма. Граждане Украины" },
          { col: "E2", key: "Гумпрограмма. Граждане ДНР с территории временно подконтрольной Украине" },
          { col: "F2", key: "Гумпрограмма. Граждане ЛНР с территории временно подконтрольной Украине" },
          { col: "G2", key: "Граждане Украины" },
          { col: "H2", key: "Граждане ЛНР" },
          { col: "I2", key: "Граждане РФ" },
          { col: "J2", key: "Кроме граждан РФ" },
          { col: "K2", key: "Вступительных испытаний в ОО ВПО" },
          { col: "L2", key: "ГИА" },
          { col: "M2", key: "ЕГЭ" },
          { col: "N2", key: "ВНО" },
          { col: "O2", key: "Диплома СПО на обучение с нормативным сроком" },
          { col: "P2", key: "Диплома СПО на обучение с сокращенным сроком" },
          { col: "Q2", key: "Диплома ВПО (бакалара, специалиста)" },
          { col: "R2", key: "ВСЕГО" },
          { col: "S2", key: "подано оригиналов документов" },
          { col: "T2", key: "подано копий документов" },
          { col: "U2", key: "подано в электронном виде" },
        ];

        matrixSheet.map((item) => {
          worksheet.getCell(item.col).addName(item.key);
          worksheet.getCell(item.col).value = item.key;
        });

        worksheet.getCell("A1:A2").value = "Наименование ОО";
        worksheet.getCell("B1:U1").value = "Из них";
        worksheet.getRow(1).font = {
          name: "Comic Sans MS",
          family: 4,
          size: 10,
          underline: "double",
          bold: true,
          color: { argb: "FF00FF00" },
        };
        worksheet.getRow(2).font = {
          name: "Comic Sans MS",
          family: 4,
          size: 10,
          underline: "double",
          bold: true,
          color: { argb: "FF00FF00" },
        };
        let startValueCell = 3;

        //* секция Проверки

        if (data.length === 0) {
          return showError(res, "Пустой массив данных");
        }
        //* endof Проверки

        //* секция Генерация отчета
        data
          .sort((a, b) => {
            return a.organization.id - b.organization.id;
          })
          .map((item) => {
            for (let i = 0; i < item.data.length; ) {
              worksheet.getCell(`A${startValueCell}`).value = item.organization.short_name || "Название ОО не указано";
              worksheet.getCell(`A${item.data.length + 1}`).value = "ИТОГО";
              for (let j = 0; j <= matrixSheet.length; j++) {
                if (j !== matrixSheet.length) {
                  if (item.data[i].column_name === matrixSheet[j].key) {
                    worksheet.getCell(`${matrixSheet[i].col[0]}${startValueCell}`).value = item.data[i].count || "отсутствуют сведения";
                    worksheet.getCell(`${matrixSheet[i].col[0]}${item.data.length + 1}`).value = 0;
                    i++;
                  }
                } else {
                }
              }
              startValueCell++;
            }
          });
        let nameFile = randomInt(0, 500);
        await workbook.xlsx.writeFile(`./reports/${nameFile}.xlsx`);

        let result = { url: `/reports/${nameFile}.xlsx`, fileName: `${nameFile}.xlsx` };
        //* endof Генерация отчета

        return showSuccess(res, null, result);
        break;
      }

      case urlPath.startsWith("/process_image"): {
        let nameFile = randomInt(0, 9999);
        let result = "";

        const form = new formidable.IncomingForm();
        form.parse(req);

        await form.on("fileBegin", function (name, file) {
        // //* секция Проверки

          if (!file.name) {
            return showError(res, "Некорректное изображение");
          }
          file.path = `./upload/${nameFile}_${file.name}`;
          result = { url: `/upload/${nameFile}_${file.name}`, fileName: `${nameFile}_${file.name}` };
        });

        form.on("file", function (name, file) {
          if (!file.name) {
            return showError(res, "Некорректное изображение");
          }
          //Ресайзн исходного изображения и сохранения его
          sharp(`.${result.url}`)
            .resize(1600, 900, {
              // fit: sharp.fit.cover,
              // fit: sharp.fit.contain,
              position: sharp.position.centre,
            })
            .toFile(`./upload/resized_to_1600x900_${result.fileName}`)
            .catch((err) => console.log(err));

          //Создания превью изображения и сохранения его

          sharp(`.${result.url}`)
            .resize(200, 200, {
              // fit: sharp.fit.cover,
              // fit: sharp.fit.contain,
              position: sharp.position.centre,
            })
            .toFile(`./upload/preview_to_200x200_${result.fileName}`)
            .catch((err) => console.log(err));
          console.log(`Uploaded  ${nameFile} - ${file.name}`);
        });




        // //* endof Проверки

        // //* секция Обработка изображения

        // //* endof Обработка изображения
        form.uploadDir = "./upload";
        return showSuccess(res, null, result);
        break;
      }
      default: {
        console.log("Incorrect request path", urlPath);
        return showError(res, "Incorrect request path");
        break;
      }
    }
  } catch (e) {
    let errorParams = { message: e.message, stackStart: e.stack.split("\n", 3) };
    console.log(errorParams);
    // logServerError("handle POST error", errorParams);
    return showError(res, e.message, errorParams);
  }
}

module.exports = handlePostRequests;
