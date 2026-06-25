export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {year} Natãn Moura. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
