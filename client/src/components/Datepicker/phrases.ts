export interface DatepickerPhrases {
  datepickerStartDatePlaceholder: string
  datepickerStartDateLabel: string
  datepickerEndDateLabel: string
  datepickerEndDatePlaceholder: string
  resetDates: string
  close: string
}
export interface DateRangeInputPhrases extends DatepickerPhrases {
  startDateAriaLabel: string
  endDateAriaLabel: string
  startDatePlaceholder: string
  endDatePlaceholder: string
}
export interface DateRangeInputPhrases extends DatepickerPhrases {
  startDateAriaLabel: string
  endDateAriaLabel: string
  startDatePlaceholder: string
  endDatePlaceholder: string
}
export interface DateSingleInputPhrases extends DatepickerPhrases {
  dateAriaLabel: string
  datePlaceholder: string
}
export const datepickerPhrases: DatepickerPhrases = {
  datepickerStartDatePlaceholder: 'Select',
  datepickerStartDateLabel: 'Дата начала:',
  datepickerEndDatePlaceholder: 'Select',
  datepickerEndDateLabel: 'Дата окончания:',
  resetDates: 'Сбросить даты',
  close: 'Close',
}
export const dateRangeInputPhrases: DateRangeInputPhrases = {
  ...datepickerPhrases,
  startDateAriaLabel: 'Дата начала',
  endDateAriaLabel: 'Дата окончания',
  startDatePlaceholder: 'Дата начала',
  endDatePlaceholder: 'Дата окончания',
}
export const dateSingleInputPhrases: DateSingleInputPhrases = {
  ...datepickerPhrases,
  dateAriaLabel: 'Выберите дату',
  datePlaceholder: 'Выберите дату',
}