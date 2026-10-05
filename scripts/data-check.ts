import assert from "node:assert/strict";
import { inMonth, parseRecordDate, sameDay } from "../src/utils/dates";
import { generateMonthlyFinancialPdf } from "../src/utils/financialPdfGenerator";

const today = new Date(2026,9,5);
assert.equal(parseRecordDate("Hoje às 10:00",today)?.getDate(),5);
assert.equal(parseRecordDate("Ontem às 16:00",today)?.getDate(),4);
assert.equal(parseRecordDate("2026-09-13 09:30")?.getMonth(),8);
assert.equal(parseRecordDate("31/02/2026"),null);
assert.equal(parseRecordDate("inválida"),null);
assert.ok(sameDay("05/10/2026",today));
assert.ok(inMonth("05/10/2026",9,2026));
assert.equal(inMonth("05/10/2026",8,2026),false);
assert.equal(inMonth("05/10/2026",9,2025),false);

const expenses = [{id:"test",desc:"Despesa de teste",category:"Outros",amount:25,date:"05/10/2026"}];
const pdf = generateMonthlyFinancialPdf({monthName:"Outubro",year:2026,orders:[],expenses,workshopName:"Oficina de teste"});
const buffer = Buffer.from(pdf.output("arraybuffer"));
assert.equal(buffer.subarray(0,5).toString(),"%PDF-");
assert.ok(buffer.length>1000);
console.log("Data checks passed: dates, monthly filters, empty revenue and financial PDF.");
