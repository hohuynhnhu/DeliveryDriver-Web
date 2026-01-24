export interface User{
    id: string
    email:string
    full_name:string | null
    phone:string | null
    avatar_url:string | null
    created_at:string | null
}

export interface AuthResponse{
    access_token:string
    refresh_token:string
    user:User
    token_type:string
    epxires_in:number
}

export interface LoginRequest{
    email:string
    password:string
}

export interface RegisterRequest{
    email:string
    password:string
    full_name:string
    phone?:string
}
export interface ApiError{
    detail:string | {detail:string}
}