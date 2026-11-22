import { describe, expect, it } from 'vitest';
import type { ITrackItem } from '../../@types/ITrackItem';
import type { AnalyserItem, AnalyserTestItemI } from './AnalyserForm.util';
import { findFirst, testAnalyserItem } from './AnalyserForm.util';
describe('findFirst', () => {
    it('должен возвращать неопределенное значение, если findRe пуст', () => {
        expect(findFirst('тестовая строка', '')).toBeUndefined();
    });
    it('должен возвращать первое совпадение, когда шаблон найден', () => {
        expect(findFirst('JIRA-123 Какая-то задача', '\\w+-\\d+')).toBe('JIRA-123');
    });
    it('должен возвращать неопределенное значение, если шаблон не найден', () => {
        expect(findFirst('Здесь нет совпадений', '\\d{3}')).toBeUndefined();
    });
    it('должен обрабатывать специальные символы в регулярном выражении', () => {
        expect(findFirst('(тест) [группа]', '\\(.*?\\)')).toBe('(тест)');
    });
    it('должен корректно обрабатывать недопустимые шаблоны регулярных выражений', () => {
        expect(findFirst('тестовая строка', '(абв.')).toBeUndefined();
        expect(findFirst('тестовая строка', 'абв)')).toBeUndefined();
        expect(findFirst('тестовая строка', '[абв.')).toBeUndefined();
        expect(findFirst('тестовая строка', 'abc{2,1}')).toBeUndefined();
    });
});
describe('testAnalyserItem', () => {
    const mockAnalyserSetting: AnalyserItem = {
        findRe: '\\w+-\\d+',
        takeTitle: 'Задача:\\s*(.*)',
        takeGroup: '\\w+-\\d+',
        enabled: true,
    };
    it('должен возвращать пустой массив, когда appItems имеет значение null или не определено', () => {
        expect(testAnalyserItem(undefined!, mockAnalyserSetting)).toEqual([]);
    });
    it('должен обрабатывать недопустимые шаблоны регулярных выражений в настройках анализатора', () => {
        const invalidPatterns: AnalyserItem[] = [
            {
                findRe: '(абв.',
                takeTitle: 'Задача:\\s*(.*)',
                takeGroup: '\\w+-\\d+',
                enabled: true,
            },
            {
                findRe: '\\w+-\\d+',
                takeTitle: '(Задача:.*',
                takeGroup: '\\w+-\\d+',
                enabled: true,
            },
            {
                findRe: '\\w+-\\d+',
                takeTitle: 'Задача:\\s*(.*)',
                takeGroup: '[группа',
                enabled: true,
            },
        ];
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'Задача JIRA-123: исправить ошибку',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];
        const firstPattern = invalidPatterns[0];
        const result = testAnalyserItem(mockAppItems, firstPattern);
        expect(result).toEqual([]);
        const secondPattern = invalidPatterns[1];
        const result2 = testAnalyserItem(mockAppItems, secondPattern);
        expect(result2).toEqual([
            {
                findRe: 'JIRA-123',
                takeGroup: 'JIRA-123',
                takeTitle: 'Задача JIRA-123: исправить ошибку',
                title: 'Задача JIRA-123: исправить ошибку',
            },
        ]);
        const thirdPattern = invalidPatterns[2];
        const result3 = testAnalyserItem(mockAppItems, thirdPattern);
        expect(result3).toEqual([
            {
                findRe: 'JIRA-123',
                takeGroup: 'JIRA-123',
                takeTitle: 'Задача: Исправить ошибку',
                title: 'Задача JIRA-123: исправить ошибку',
            },
        ]);
    });
    it('должен обрабатывать элементы приложения и возвращать соответствующие тестовые элементы', () => {
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'Задача JIRA-123: исправить ошибку',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 2,
                title: 'Задача JIRA-456: добавить функцию',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 3,
                title: 'Здесь нет совпадений',
                app: 'Other',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];
        const expected: AnalyserTestItemI[] = [
            {
                title: 'Задача JIRA-123: исправить ошибку',
                findRe: 'JIRA-123',
                takeGroup: 'JIRA-123',
                takeTitle: 'Задача: Исправить ошибку',
            },
            {
                title: 'Задача JIRA-456: добавить функцию',
                findRe: 'JIRA-456',
                takeGroup: 'JIRA-456',
                takeTitle: 'Задача: Добавить функцию',
            },
        ];
        const result = testAnalyserItem(mockAppItems, mockAnalyserSetting);
        expect(result).toEqual(expected);
    });
    it('следует удалить повторяющиеся элементы на основе заголовка', () => {
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'Задача JIRA-123: исправить ошибку',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 2,
                title: 'Задача JIRA-123: исправить ошибку',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 3,
                title: 'Задача JIRA-456: добавить функцию',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];
        const result = testAnalyserItem(mockAppItems, mockAnalyserSetting);
        expect(result.length).toBe(2);
        expect(result.filter((item) => item.findRe === 'JIRA-123')).toHaveLength(1);
    });
    it('должен обрабатывать пустые или недопустимые шаблоны регулярных выражений', () => {
        const invalidAnalyserSetting: AnalyserItem = {
            findRe: '',
            takeTitle: '',
            takeGroup: '',
            enabled: true,
        };
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'Задача JIRA-123: исправить ошибку',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];
        const result = testAnalyserItem(mockAppItems, invalidAnalyserSetting);
        expect(result).toEqual([]);
    });
    it('должен обрабатывать отсутствующий заголовок в элементах приложения', () => {
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 2,
                title: '',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 3,
                title: 'Задача JIRA-123: исправить ошибку',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];
        const result = testAnalyserItem(mockAppItems, mockAnalyserSetting);
        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Задача JIRA-123: исправить ошибку');
    });
});