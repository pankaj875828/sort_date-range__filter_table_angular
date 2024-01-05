import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { data } from './data';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'angular';
  sortDir = 1;
  windowScrolled = false;
  employee_data: any = data;
  loader = false;
  filterdata: any;
  date_range: any = FormGroup;
  filteredItems: any = [];
  copy_data:any=[]
  today = new Date().toJSON().split('T')[0]
  searchText: string | undefined;

  @ViewChild('htmlData') htmlData!: ElementRef;

  constructor(private _fb: FormBuilder) {
    this.date_range = this._fb.group({
      start_date: ['',Validators.required],
      end_date: ['',Validators.required],
    });
  }

  ngOnInit(): void {
    window.addEventListener('scroll', () => {
      this.windowScrolled = window.pageYOffset !== 0;
    });
    this.copy_data = [...this.employee_data]
  }

  // download CSV File

  downloadFile(data: any, filename = 'data') {
    let csvData = this.ConvertToCSV(data, [
      'name',
      'email',
      'job_title',
      'department',
      'start_date',
    ]);
    console.log(csvData);
    let blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;',
    });
    let dwldLink = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser =
      navigator.userAgent.indexOf('Safari') != -1 &&
      navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename + '.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  // convert to CSV

  ConvertToCSV(objArray: any, headerList: any) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';

    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = i + 1 + '';
      for (let index in headerList) {
        let head = headerList[index];

        line += ',' + array[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }

  // CSV Download

  jsontocsv() {
    this.downloadFile(this.employee_data, 'jsontocsv_data');
  }

  // coloum Sort

  onSortClick(event: any, col: any) {
    let target = event.currentTarget,
      classList = target.classList;

    if (classList.contains('fa-chevron-up')) {
      classList.remove('fa-chevron-up');
      classList.add('fa-chevron-down');
      this.sortDir = -1;
    } else {
      classList.add('fa-chevron-up');
      classList.remove('fa-chevron-down');
      this.sortDir = 1;
    }
    this.sortArr(col);
  }

  sortArr(colName: any) {
    this.employee_data.sort((a: any, b: any) => {
      a = a[colName].toLowerCase();
      b = b[colName].toLowerCase();
      return a.localeCompare(b) * this.sortDir;
    });
  }

  // PDF Download

  public openPDF(): void {
    this.loader = true;
    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA).then((canvas: any) => {
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      heightLeft -= pageHeight;
      const doc = new jspdf('p', 'mm');
      doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(
          canvas,
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        heightLeft -= pageHeight;
      }
      doc.save('employee_data.pdf');
      this.loader = false;
    });
  }

  // scroll to top

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  // date-range filter

  applyFilter() {
    console.log(this.date_range.value);
    let filter :any = []
    this.employee_data = this.copy_data
    this.employee_data.map((item:any)=>{
      if(formatDate(item.start_date,'yyyy-MM-dd','en_US') >= formatDate(this.date_range.value.start_date,'yyyy-MM-dd','en_US') && formatDate(item.start_date,'yyyy-MM-dd','en_US') <= formatDate(this.date_range.value.end_date,'yyyy-MM-dd','en_US')){
        filter.push(item)
        this.employee_data = filter
      }else{
        console.log('data not found')
        this.employee_data = filter
      }
    })
  }

  // reset date-range filter

  resetFilter(){
    this.date_range.reset();
    this.employee_data = this.copy_data
    console.log(this.employee_data.length)
  }
}

