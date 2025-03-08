<template>
  <button @click="exportExcel">Xuất Excel</button>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  methods: {
    exportExcel() {
      const data = [
        {
          "Họ tên": "Nguyễn Văn A",
          "Khung giờ": "",
          "Ngày sinh": "27/01/2024",
        },
        { "Họ tên": "Trần Thị B", "Khung giờ": "", "Ngày sinh": "15/02/2024" },
      ];

      // Tạo sheet từ JSON
      const ws = XLSX.utils.json_to_sheet(data, { cellDates: true });

      // Xác định cột "Khung giờ"
      const headers = Object.keys(data[0]);
      const khungGioIndex = headers.indexOf("Khung giờ");

      if (khungGioIndex !== -1) {
        const colLetter = XLSX.utils.encode_col(khungGioIndex); // VD: B
        const dropListRange = `${colLetter}2:${colLetter}100`; // Dropdown từ B2 -> B100

        // Chèn danh sách khung giờ vào một cột khác (VD: cột "J")
        const timeSlots = [
          "07:30 - 09:00",
          "09:00 - 10:30",
          "13:00 - 14:00",
          "14:00 - 15:30",
        ];
        timeSlots.forEach((slot, index) => {
          const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: 9 }); // Cột J (index 9)
          ws[cellRef] = { t: "s", v: slot };
        });

        // Áp dụng Data Validation bằng cách tham chiếu cột J
        ws["!dataValidations"] = ws["!dataValidations"] || [];
        ws["!dataValidations"].push({
          type: "list",
          allowBlank: true,
          formula1: "J2:J5", // Tham chiếu danh sách trong cột J
          sqref: dropListRange,
        });
      }

      // Tạo workbook và xuất file
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách");
      XLSX.writeFile(wb, "DanhSach.xlsx");
    },
  },
};
</script>

<style>
</style>