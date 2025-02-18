import StudioRepository from '../dataaccess/repositories/studioRepository.js';

class StudioService {
    constructor() {
        this.studioRepository = new StudioRepository();
    }

    async getStudioList(limit, offset) {
        return this.studioRepository.getStudios(parseInt(limit, 10), parseInt(offset, 10));
    }

    async getStudio(id) {
        return this.studioRepository.getStudio(id);
    }

    // async search() {

    // }

    // async booking() {

    // }
}


export default StudioService;