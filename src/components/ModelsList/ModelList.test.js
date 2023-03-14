/* eslint-disable jest/no-mocks-import */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import ModelList from './ModelList';
import { modelsService } from '../../services/ModelsService';
import allModels from '../../__mocks__/allModels';
import allTags from '../../__mocks__/allTags';
import user from '@testing-library/user-event'
import { filesService } from '../../services/FilesService';

jest.mock('../../services/ModelsService');
jest.mock('../../services/FilesService');

beforeEach(() => {
    //jest.runOnlyPendingTimers();
    jest.useFakeTimers();
})

afterEach(cleanup);

describe('ModelList', () => {
    it('open dialog when "New" button is clicked', () => {
        render(<ModelList />);

        expect(screen.getByText("New")).toBeInTheDocument();

        fireEvent.click(screen.getByText("New"));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('render grid with correct models', async () => {
        jest.spyOn(modelsService, 'getAllModels').mockResolvedValue(allModels);
        jest.spyOn(modelsService, 'getAllTags').mockResolvedValue(allTags);
        URL.createObjectURL = jest.fn();
        //jest.spyOn(filesService, 'getFileById').mockResolvedValue('allTags');
        //modelsService.getAllModels = jest.fn().mockResolvedValue(allModels);

        
        render(<ModelList />);

        await waitFor(() => {
            expect(screen.getByText("test 1")).toBeInTheDocument();
            expect(screen.getByText("test 2")).toBeInTheDocument();
            expect(screen.getByText("test 3")).toBeInTheDocument();
        });
    });

    /*it('filter models', async () => {
        jest.spyOn(modelsService, 'getAllModels').mockRejectedValue(allModels);
        jest.spyOn(modelsService, 'getAllTags').mockResolvedValue(allTags);
        URL.createObjectURL = jest.fn();
        
        render(<ModelList />);

        const filter = screen.getByLabelText('Filter');
        user.type(filter, '3');

        await waitFor(() => {
            expect(screen.getByText('test 3')).toBeInTheDocument();
            expect(screen.queryByText('test 2')).toBeNull();
        });
    });*/
});

