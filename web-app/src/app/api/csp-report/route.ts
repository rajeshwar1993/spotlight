import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env-validation';
import { withSentryErrorHandling, ErrorLogger } from '@/lib/monitoring/sentry';

interface CSPReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
    'status-code': number;
    'script-sample': string;
  };
}

async function handler(request: NextRequest) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Only process CSP reports in production
  if (!config.isProduction) {
    return NextResponse.json(
      { message: 'CSP reporting disabled in development' },
      { status: 200 }
    );
  }

  try {
    const report: CSPReport = await request.json();
    
    if (!report['csp-report']) {
      return NextResponse.json(
        { error: 'Invalid CSP report format' },
        { status: 400 }
      );
    }

    // Process the CSP violation
    await processCSPViolation(report['csp-report'], request);

    return NextResponse.json(
      { message: 'CSP report processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processCSPViolation(violation: CSPReport['csp-report'], request: NextRequest) {
  const {
    'document-uri': documentUri,
    'referrer': referrer,
    'violated-directive': violatedDirective,
    'effective-directive': effectiveDirective,
    'original-policy': originalPolicy,
    'blocked-uri': blockedUri,
    'line-number': lineNumber,
    'column-number': columnNumber,
    'source-file': sourceFile,
    'status-code': statusCode,
    'script-sample': scriptSample,
  } = violation;

  // Extract request metadata
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';

  // Create violation record
  const violationRecord = {
    document_uri: documentUri,
    referrer,
    violated_directive: violatedDirective,
    effective_directive: effectiveDirective,
    original_policy: originalPolicy,
    blocked_uri: blockedUri,
    line_number: lineNumber,
    column_number: columnNumber,
    source_file: sourceFile,
    status_code: statusCode,
    script_sample: scriptSample,
    user_agent: userAgent,
    ip_address: anonymizeIP(ip),
    timestamp: new Date().toISOString(),
  };

  // Log the violation
  console.warn('CSP Violation:', violationRecord);

  // Determine severity
  const severity = determineSeverity(violatedDirective, blockedUri);

  // Store in database
  await storeCSPViolation(violationRecord);

  // Send to Sentry
  ErrorLogger.captureMessage(
    `CSP Violation: ${violatedDirective}`,
    severity,
    {
      csp_violation: violationRecord,
      blocked_uri: blockedUri,
      document_uri: documentUri,
    }
  );

  // Send alerts for critical violations
  if (severity === 'error') {
    await sendCSPAlert(violationRecord);
  }

  // Check for patterns that might indicate attacks
  await analyzeViolationPattern(violationRecord);
}

function determineSeverity(violatedDirective: string, blockedUri: string): 'info' | 'warning' | 'error' {
  // Critical violations that might indicate attacks
  const criticalDirectives = [
    'script-src',
    'object-src',
    'base-uri',
    'form-action',
  ];

  // Check if it's a critical directive
  if (criticalDirectives.some(directive => violatedDirective.includes(directive))) {
    return 'error';
  }

  // Check for suspicious URIs
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /ftp:/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(blockedUri))) {
    return 'error';
  }

  // External resources might be warnings
  if (blockedUri.startsWith('http') && !blockedUri.includes(config.appUrl)) {
    return 'warning';
  }

  return 'info';
}

async function storeCSPViolation(violation: any) {
  // Store in database
  console.log('Storing CSP violation:', violation);
  
  // In production, store in database:
  // await supabase.from('csp_violations').insert(violation);
}

async function sendCSPAlert(violation: any) {
  // Send alert for critical CSP violations
  const alert = {
    type: 'csp_violation',
    severity: 'critical',
    message: `Critical CSP violation: ${violation.violated_directive}`,
    details: violation,
    timestamp: new Date().toISOString(),
  };

  console.error('Critical CSP violation alert:', alert);
  
  // In production, send to alerting system:
  // - Slack notification
  // - Email to security team
  // - PagerDuty alert
}

async function analyzeViolationPattern(violation: any) {
  // Analyze patterns to detect potential attacks
  const patterns = await getRecentViolationPatterns();
  
  // Check for multiple violations from same IP
  const sameIPViolations = patterns.filter(p => 
    p.ip_address === violation.ip_address &&
    Date.now() - new Date(p.timestamp).getTime() < 60000 // Within 1 minute
  );

  if (sameIPViolations.length > 5) {
    await handleSuspiciousActivity(violation.ip_address, sameIPViolations);
  }

  // Check for script injection attempts
  if (violation.script_sample && isScriptInjectionAttempt(violation.script_sample)) {
    await handleScriptInjectionAttempt(violation);
  }
}

async function getRecentViolationPatterns(): Promise<any[]> {
  // Get recent CSP violations from database
  // In production, query database:
  // return await supabase
  //   .from('csp_violations')
  //   .select('*')
  //   .gte('timestamp', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
  //   .order('timestamp', { ascending: false });
  
  return [];
}

async function handleSuspiciousActivity(ipAddress: string, violations: any[]) {
  // Handle potential attack from IP
  const alert = {
    type: 'suspicious_activity',
    severity: 'high',
    message: `Multiple CSP violations from IP: ${ipAddress}`,
    ip_address: ipAddress,
    violation_count: violations.length,
    violations,
    timestamp: new Date().toISOString(),
  };

  console.error('Suspicious activity detected:', alert);
  
  // In production:
  // - Rate limit IP
  // - Send security alert
  // - Consider IP blocking
}

async function handleScriptInjectionAttempt(violation: any) {
  // Handle potential script injection
  const alert = {
    type: 'script_injection_attempt',
    severity: 'critical',
    message: 'Potential script injection attempt detected',
    violation,
    timestamp: new Date().toISOString(),
  };

  console.error('Script injection attempt:', alert);
  
  // In production:
  // - Immediate security alert
  // - Block IP if confirmed
  // - Log for security audit
}

function isScriptInjectionAttempt(scriptSample: string): boolean {
  const injectionPatterns = [
    /<script/i,
    /javascript:/i,
    /eval\(/i,
    /document\.write/i,
    /innerHTML/i,
    /setTimeout/i,
    /setInterval/i,
    /window\.location/i,
    /document\.cookie/i,
  ];

  return injectionPatterns.some(pattern => pattern.test(scriptSample));
}

function anonymizeIP(ip: string): string {
  // Anonymize IP for privacy compliance
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  return 'anonymized';
}

export const POST = withSentryErrorHandling(handler, 'csp-report');