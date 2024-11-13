/**
 * Human Tasks:
 * 1. Configure Auth0 test tenant with appropriate test credentials
 * 2. Set up test environment variables for Auth0 configuration
 * 3. Verify test user accounts are properly configured in Auth0
 * 4. Ensure test environment has proper CORS and redirect URI settings
 */

// @testing-library/react v14.0.0
import { screen, waitFor } from '@testing-library/react';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';
// jest v29.0.0
import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';

// Internal imports
import { authService } from '../../src/services/auth.service';
import { renderWithProviders } from '../../src/utils/test.utils';
import LoginPage from '../../src/pages/Auth/LoginPage';

// Mock Auth0 client
jest.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: jest.fn().mockImplementation(() => ({
    loginWithRedirect: jest.fn(),
    handleRedirectCallback: jest.fn(),
    getTokenSilently: jest.fn(),
    logout: jest.fn(),
    getUser: jest.fn(),
    isAuthenticated: jest.fn()
  }))
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/login',
    search: '',
    hash: '',
    state: null
  })
}));

describe('Authentication Flow', () => {
  const mockUser = userEvent.setup();
  
  // Test data from specification
  const mockUserProfile = {
    sub: 'auth0|123',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    picture: 'https://example.com/avatar.jpg'
  };

  const mockTokens = {
    accessToken: 'eyJ0...',
    idToken: 'eyJ1...',
    expiresIn: 3600
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  /**
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   */
  it('should redirect to Auth0 login', async () => {
    // Arrange
    const loginSpy = jest.spyOn(authService, 'login');
    renderWithProviders(<LoginPage />);

    // Act
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    await mockUser.click(loginButton);

    // Assert
    expect(loginSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          redirect_uri: expect.any(String),
          audience: expect.any(String),
          scope: expect.stringContaining('openid profile email')
        })
      );
    });
  });

  /**
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   * @implements Authorization Model requirement from 7.1.2 Authorization Model
   */
  it('should handle successful login callback', async () => {
    // Arrange
    const getAccessTokenSpy = jest.spyOn(authService, 'getAccessToken');
    const getUserProfileSpy = jest.spyOn(authService, 'getUserProfile');
    
    getAccessTokenSpy.mockResolvedValue(mockTokens.accessToken);
    getUserProfileSpy.mockResolvedValue(mockUserProfile);

    // Act
    renderWithProviders(<LoginPage />);
    
    // Simulate Auth0 callback
    await waitFor(() => {
      expect(getAccessTokenSpy).toHaveBeenCalled();
      expect(getUserProfileSpy).toHaveBeenCalled();
    });

    // Assert
    expect(localStorage.getItem('access_token')).toBe(mockTokens.accessToken);
    expect(JSON.parse(localStorage.getItem('user_profile') || '{}')).toEqual(mockUserProfile);
  });

  /**
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   */
  it('should handle login errors', async () => {
    // Arrange
    const error = new Error('Login failed');
    jest.spyOn(authService, 'login').mockRejectedValue(error);
    
    // Act
    renderWithProviders(<LoginPage />);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    await mockUser.click(loginButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  /**
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   */
  it('should handle logout', async () => {
    // Arrange
    const logoutSpy = jest.spyOn(authService, 'logout');
    localStorage.setItem('access_token', mockTokens.accessToken);
    localStorage.setItem('user_profile', JSON.stringify(mockUserProfile));

    // Act
    await authService.logout();

    // Assert
    expect(logoutSpy).toHaveBeenCalled();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('user_profile')).toBeNull();
  });

  /**
   * @implements Authentication Methods requirement from 7.1.1 Authentication Methods
   */
  it('should refresh expired tokens', async () => {
    // Arrange
    const expiredToken = 'expired_token';
    const newToken = 'new_token';
    const getAccessTokenSpy = jest.spyOn(authService, 'getAccessToken');
    
    // Mock expired token
    localStorage.setItem('access_token', expiredToken);
    localStorage.setItem('token_expiry', (Date.now() - 1000).toString());
    
    // Mock token refresh
    getAccessTokenSpy.mockResolvedValue(newToken);

    // Act
    const token = await authService.getAccessToken();

    // Assert
    expect(getAccessTokenSpy).toHaveBeenCalled();
    expect(token).toBe(newToken);
    expect(localStorage.getItem('access_token')).toBe(newToken);
    expect(parseInt(localStorage.getItem('token_expiry') || '0')).toBeGreaterThan(Date.now());
  });

  /**
   * @implements Authorization Model requirement from 7.1.2 Authorization Model
   */
  it('should validate user roles and permissions', async () => {
    // Arrange
    const getUserProfileSpy = jest.spyOn(authService, 'getUserProfile');
    getUserProfileSpy.mockResolvedValue({
      ...mockUserProfile,
      roles: ['admin', 'user']
    });

    // Act
    const userProfile = await authService.getUserProfile();

    // Assert
    expect(userProfile.roles).toContain('admin');
    expect(userProfile.roles).toContain('user');
    expect(JSON.parse(localStorage.getItem('user_profile') || '{}')).toEqual(userProfile);
  });
});