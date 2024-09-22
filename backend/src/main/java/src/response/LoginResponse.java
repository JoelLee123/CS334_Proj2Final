package src.response;

public class LoginResponse {
    private String token;

    private long expiresIn;

    public String getToken() {
        return token;
    }

    public void setToken(String jwtToken) {
        this.token = jwtToken;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expirationTime) {
        this.expiresIn = expirationTime;
    }
}