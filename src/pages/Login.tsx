import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, currentUser } = useAuthStore();
  const navigate = useNavigate();

  if (currentUser) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    const result = login(username, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <img src={palvisionLogo} alt="Palestinian Vision" className="h-16 object-contain mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">تسجيل الدخول</h1>
            <p className="text-sm text-muted-foreground">أدخل بيانات الدخول للمتابعة إلى النظام</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="h-11"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="h-11 pl-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-semibold">
              دخول
            </Button>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">بيانات تجريبية:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">مسؤول:</span> admin / admin123</p>
              <p><span className="font-medium">مدير مشاريع:</span> manager / manager123</p>
              <p><span className="font-medium">مستخدم عادي:</span> user1 / user123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Left: Decorative */}
      <div className="hidden lg:flex w-[480px] bg-sidebar items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 size-40 border-2 border-sidebar-primary rounded-full" />
          <div className="absolute bottom-32 left-16 size-60 border border-sidebar-primary/50 rounded-full" />
          <div className="absolute top-1/2 right-1/3 size-24 border border-sidebar-primary/30 rounded-lg rotate-45" />
        </div>
        <div className="relative z-10 text-center">
          
          <h2 className="text-2xl font-bold text-sidebar-foreground mb-3">نظام إدارة المشاريع</h2>
          <p className="text-sm text-sidebar-foreground/60 leading-relaxed max-w-xs mx-auto">
            نظام متكامل لإدارة المشاريع المجتمعية والمتطوعين والشراكات
          </p>
        </div>
      </div>
    </div>
  );
}


