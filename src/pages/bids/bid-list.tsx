import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { getBids } from "@/http/bids/get-bids"
import { useQuery } from "@tanstack/react-query"
import { Ellipsis, Eye, LoaderCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CITIES } from "./constants"
import { useFiltersStore } from "@/stores/use-filters-store"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect } from "react"
import { formatCurrency } from "@/utils/format-currency"
import { Button } from "@/components/ui/button"

export function BidList() {
  const { filters, setFilters, setCity } = useFiltersStore()
  const [searchParams, _] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const city = searchParams.get("city") || ""
    const year = searchParams.get("year") || ""
    const name = searchParams.get("name") || ""
    const situation = searchParams.get("situation") || ""
    const value = searchParams.get("value") || ""

    setFilters({ year, name, situation, value, city })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()

    if (filters.city) params.set("city", filters.city)
    if (filters.year) params.set("year", filters.year)
    if (filters.name) params.set("name", filters.name)
    if (filters.situation) params.set("situation", filters.situation)
    if (filters.value) params.set("value", filters.value)

    navigate(`?${params.toString()}`, { replace: true })
  }, [filters])

  const { data, isLoading } = useQuery({
    queryKey: ['bids', filters.company, filters.year],
    queryFn: () => getBids(),
    enabled: !!filters.city
  })

  const situationStyle: Record<string, string> = {
    'em andamento': "bg-yellow-300 text-yellow-800",
    homologada: "bg-green-300 text-green-800",
    revogada: "bg-red-300 text-red-800",
    classificada: "bg-red-300 text-red-800",
    encerrada: "bg-gray-300 text-gray-800",
  }

  return (
    <div>
      {isLoading ? (
        <div className="w-full flex justify-center py-8">
          <LoaderCircle className="animate-spin size-6 text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <form className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-3">
              <Label>Cidade</Label>
              <Select value={filters.city} onValueChange={(value) => setCity(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="col-span-2">
              <Label>Ano</Label>
              <Select
                value={filters.year}
                onValueChange={(value) => setFilters({ year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              <Label>Nome</Label>
              <Input
                placeholder="Filtrar por nome"
                value={filters.name}
                onChange={(e) => setFilters({ name: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>Situação</Label>
              <Select
                value={filters.situation}
                onValueChange={(value) => setFilters({ situation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emAndamento">Em andamento</SelectItem>
                  <SelectItem value="homologada">Homologada</SelectItem>
                  <SelectItem value="revogada">Revogada</SelectItem>
                  <SelectItem value="classificada">Classificada</SelectItem>
                  <SelectItem value="encerrada">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Valor</Label>
              <Input
                placeholder="Filtrar por valor"
                value={filters.value}
                onChange={(e) => setFilters({ value: e.target.value })}
              />
            </div>
          </form>

          {filters.city ? (
            <div className="rounded-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Número</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-center">Situação</TableHead>
                    <TableHead className="text-center">Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="flex justify-center items-center">
                      <Ellipsis className="size-4" />
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.map((bid) => (
                    <TableRow key={bid.NLICITACAO} className="cursor-pointer">
                      <TableCell className="py-3 text-center">{bid.NLICITACAO || "-"}</TableCell>
                      <TableCell className="py-3">{bid.LICIT || "-"}</TableCell>
                      <TableCell className="py-3">
                        <p className={`w-full text-center px-2 py-1 rounded-md text-xs font-medium ${situationStyle[bid.SITUACAO.trim().toLocaleLowerCase()] || ""}`}>
                          {bid.SITUACAO.trim() || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-center">{formatCurrency(bid.VALOR)}</TableCell>
                      <TableCell className="py-3">{bid.DATAE || "-"}</TableCell>
                      <TableCell className="py-3 flex justify-center">
                        <Button variant="ghost">
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-sm p-4">
              <p className="text-sm text-muted-foreground text-center">Selecione uma <strong>cidade</strong> para buscar as licitações</p>
            </div>
          )}
        </div >
      )}
    </div >
  )
}