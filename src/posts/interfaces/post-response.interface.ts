import { PostEntity } from '../entities/post.entity';

interface Response {
    message: string;
}

interface CreatePostResponse extends Response {}

interface UpdatePostResponse extends Response {}

interface DeletePostResponse extends Response {}

interface findAllPostsRespone {
    data: PostEntity[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    }
}
export {CreatePostResponse, UpdatePostResponse, DeletePostResponse, findAllPostsRespone  };