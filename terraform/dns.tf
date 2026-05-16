data "aws_route53_zone" "main" {
  name         = "nikolaydimitrov.dev"
  private_zone = false
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "nikolaydimitrov.dev"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_subdomain" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.nikolaydimitrov.dev"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# DMARC: upgrade from p=none (monitor-only) to enforcement + aggregate reports.
# allow_overwrite takes over the pre-existing manually created record.
resource "aws_route53_record" "dmarc" {
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = "_dmarc.nikolaydimitrov.dev"
  type            = "TXT"
  ttl             = 300
  allow_overwrite = true
  records         = ["v=DMARC1; p=quarantine; rua=mailto:${var.alert_email}; fo=1; adkim=s; aspf=r"]
}