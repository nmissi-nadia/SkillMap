package com.skill.backend.config;

import com.skill.backend.service.JwtService;
import com.skill.backend.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        System.out.println("🔍 JwtAuthenticationFilter - Processing request: " + request.getRequestURI());
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
            System.out.println("⚠️ No Bearer token found in Authorization header");
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        System.out.println("📝 JWT Token extracted (first 20 chars): " + jwt.substring(0, Math.min(20, jwt.length())) + "...");
        
        // Vérifier si le token est blacklisté
        if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
            System.out.println("🚫 Token is blacklisted - rejecting request");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Token has been revoked\"}");
            return;
        }
        
        userEmail = jwtService.extractUsername(jwt);
        System.out.println("👤 Extracted username from JWT: " + userEmail);
        
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            System.out.println("📚 Loaded UserDetails for: " + userEmail);
            System.out.println("🔑 UserDetails authorities: " + userDetails.getAuthorities());
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                System.out.println("✅ JWT token is valid");
                
                // Extraire les authorities du JWT
                List<String> authoritiesFromToken = jwtService.extractAuthorities(jwt);
                System.out.println("🎫 Authorities from JWT token: " + authoritiesFromToken);
                
                List<GrantedAuthority> authorities;
                
                // Si les authorities ne sont pas dans le JWT, utiliser celles de la base de données
                if (authoritiesFromToken != null && !authoritiesFromToken.isEmpty()) {
                    authorities = authoritiesFromToken.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    System.out.println("✅ Using authorities from JWT: " + authorities);
                } else {
                    authorities = new java.util.ArrayList<>(userDetails.getAuthorities());
                    System.out.println("⚠️ JWT authorities null/empty, using database authorities: " + authorities);
                }
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                System.out.println("🔐 Authentication set in SecurityContext");
                System.out.println("🔐 Final authorities in context: " + authToken.getAuthorities());
            } else {
                System.out.println("❌ JWT token is NOT valid");
            }
        } else if (userEmail == null) {
            System.out.println("⚠️ Could not extract username from JWT");
        } else {
            System.out.println("ℹ️ Authentication already exists in SecurityContext");
        }
        
        filterChain.doFilter(request, response);
        System.out.println("✅ Filter chain completed for: " + request.getRequestURI());
    }
}
