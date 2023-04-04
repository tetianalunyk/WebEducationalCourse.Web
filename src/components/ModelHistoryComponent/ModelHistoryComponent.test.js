/* eslint-disable jest/no-mocks-import */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ModelHistoryComponent from './ModelHistoryComponent';
import { modelsService } from '../../services/ModelsService';
import allModels from '../../__mocks__/allModels';
import allTags from '../../__mocks__/allTags';

jest.mock('../../services/ModelsService');
jest.mock('../../services/FilesService');
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
    jest.useFakeTimers();
})

afterEach(cleanup);

describe('ModelHistoryComponent', () => {
    it('should contain tag search and filter', () => {
        render(<ModelHistoryComponent />);

        expect(screen.getByText('Tags')).toBeInTheDocument();
        expect(screen.getByTestId('filter')).toBeInTheDocument();
    });

    it('render grid with correct models', async () => {
        jest.spyOn(modelsService, 'getAllModels').mockResolvedValue(allModels);
        jest.spyOn(modelsService, 'getAllTags').mockResolvedValue(allTags);
        URL.createObjectURL = jest.fn();

        
        render(<ModelHistoryComponent />);

        await waitFor(() => {
            expect(screen.getByText("test 1")).toBeInTheDocument();
            expect(screen.getByText("test 2")).toBeInTheDocument();
            expect(screen.getByText("test 3")).toBeInTheDocument();
        });
    });
});

